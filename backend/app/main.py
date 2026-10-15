"""
Safe Jobs Shield - Primary FastAPI Service.
Zimbabwe Youth Innovation HackLab 2026.
"""

import time
import json
import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .privacy import redact_pii, compute_hmac_sha256
from .rules import analyze_job_offer
from .reputation import global_reputation_store
from .whatsapp import verify_webhook_handshake, process_whatsapp_payload
from .infra import inspect_domain_heuristics
from .ml import TfidfLogisticClassifier

app = FastAPI(
    title="Safe Jobs Shield API",
    description="Privacy-first, multilingual job-offer verification service for youth in Zimbabwe.",
    version="1.0.0-hacklab2026",
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load verified employers registry from local data
REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data", "employers.json")
VERIFIED_EMPLOYERS: List[Dict[str, Any]] = []

if os.path.exists(REGISTRY_PATH):
    try:
        with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
            VERIFIED_EMPLOYERS = json.load(f)
    except Exception as e:
        print(f"Notice: Failed to load employers registry from {REGISTRY_PATH}: {e}")

# Initialize ML baseline
ml_model = TfidfLogisticClassifier()
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "baseline_model.pkl")
if os.path.exists(MODEL_PATH):
    ml_model.load(MODEL_PATH)


# --- Pydantic Request / Response Models ---

class CheckRequest(BaseModel):
    message: str = Field(..., description="Job offer text, email, recruiter phone, or URL to evaluate")
    language: Optional[str] = Field("en", description="Target language: en, sn (Shona), nd (Ndebele)")
    include_ml: Optional[bool] = Field(True, description="Whether to include ML classifier score")


class CheckResponse(BaseModel):
    score: int
    verdict: str
    signals: List[Dict[str, Any]]
    positive_signals: List[Dict[str, Any]]
    is_emergency_trafficking: bool
    helpline: Optional[Dict[str, Any]]
    redacted_text: str
    entities: Dict[str, Any]
    matched_employer: Optional[Dict[str, Any]]
    ml_scam_probability: Optional[float] = None
    evaluation_latency_ms: float
    data_protection_notice: str


class ReportRequest(BaseModel):
    identifier: str = Field(..., description="Recruiter phone number, URL, or email to flag")
    category: str = Field(..., description="Scam type: advance_fee, trafficking_risk, phishing_link, etc.")
    reporter_token: Optional[str] = Field("anon", description="Session token used for rate limiting")


class ReportResponse(BaseModel):
    success: bool
    hashed_identifier: str
    raw_count: int
    weighted_score: float
    message: str


# --- API Routes ---

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Safe Jobs Shield API",
        "version": "1.0.0-hacklab2026",
        "regulatory_alignment": "Zimbabwe Cyber and Data Protection Act [Chapter 12:07]",
        "registered_employers_count": len(VERIFIED_EMPLOYERS),
        "ml_baseline_loaded": ml_model.is_fitted
    }


@app.post("/check", response_model=CheckResponse, tags=["Verification"])
async def check_job_offer(req: CheckRequest):
    """
    Main verification endpoint.
    Performs PII sanitization, runs defensive rules heuristics, evaluates ML probability,
    and returns transparent diagnostic findings.
    """
    start_time = time.perf_counter()
    
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Empty job offer text provided.")

    # Execute deterministic rules engine
    result = analyze_job_offer(
        req.message,
        community_lookup=global_reputation_store.get_reputation,
        verified_registry=VERIFIED_EMPLOYERS
    )

    # Optional ML inference
    ml_prob = None
    if req.include_ml and ml_model.is_fitted:
        probs = ml_model.predict_proba([result["redacted_text"]])
        ml_prob = round(probs[0], 3)

    latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return CheckResponse(
        score=result["score"],
        verdict=result["verdict"],
        signals=result["signals"],
        positive_signals=result["positive_signals"],
        is_emergency_trafficking=result["is_emergency_trafficking"],
        helpline=result["helpline"],
        redacted_text=result["redacted_text"],
        entities=result["entities"],
        matched_employer=result["matched_employer"],
        ml_scam_probability=ml_prob,
        evaluation_latency_ms=latency_ms,
        data_protection_notice="Zero raw messages retained on disk. Irreversible HMAC-SHA256 digests used."
    )


@app.post("/report", response_model=ReportResponse, tags=["Reputation"])
async def submit_report(req: ReportRequest):
    """
    Records a community scam report.
    Hashes the identifier immediately and enforces anti-poisoning rate limits.
    """
    if not req.identifier.strip():
        raise HTTPException(status_code=400, detail="Identifier cannot be empty.")

    res = global_reputation_store.add_report(
        identifier=req.identifier,
        category=req.category,
        reporter_token=req.reporter_token
    )

    if not res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=res.get("message", "Rate limit exceeded.")
        )

    return ReportResponse(
        success=True,
        hashed_identifier=res["hashed_identifier"],
        raw_count=res["raw_count"],
        weighted_score=res["weighted_score"],
        message="Cryptographic HMAC-SHA256 recorded to community reputation pool."
    )


@app.get("/employers", tags=["Pathway"])
async def get_verified_employers():
    """
    Returns the certified Zimbabwean employer registry.
    Includes public keys and digital signatures for client-side tamper-verification.
    """
    return {
        "count": len(VERIFIED_EMPLOYERS),
        "registry": VERIFIED_EMPLOYERS
    }


# --- WhatsApp Cloud API Webhook Endpoints ---

@app.get("/webhook", tags=["WhatsApp"])
async def whatsapp_webhook_verification(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """Meta verification handshake."""
    if not hub_mode or not hub_verify_token:
        raise HTTPException(status_code=400, detail="Missing challenge parameters.")
    
    challenge = verify_webhook_handshake(hub_mode, hub_verify_token, hub_challenge or "")
    if challenge:
        return Response(content=challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification token mismatch.")


@app.post("/webhook", tags=["WhatsApp"])
async def whatsapp_webhook_handler(request: Request):
    """Handles incoming WhatsApp messages."""
    try:
        body = await request.json()
        res = await process_whatsapp_payload(body)
        return {"status": "success", "result": res}
    except Exception as e:
        return {"status": "error", "message": str(e)}
