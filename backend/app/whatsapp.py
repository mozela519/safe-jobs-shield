"""
WhatsApp Cloud API Integration Skeleton.
Handles Meta Webhook verification handshake, incoming message parsing, and formatted replies.

REQUIREMENT NOTICE:
Production deployment requires:
1. Meta Business Manager Verified Account & Zimbabwe Registered Entity
2. Approved WhatsApp Business Platform number (+263 77... / +263 242...)
3. Partner telco zero-rating agreement for unmetered youth data access.

FALLBACK ARCHITECTURE:
For youth without WhatsApp or smartphones, our SMS/USSD Gateway (*707#)
executes the exact same deterministic rules engine without Meta dependency.
"""

import os
import re
from typing import Dict, Any, Optional
import httpx
from .rules import analyze_job_offer
from .reputation import global_reputation_store
from .privacy import redact_pii

WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "sjs_secret_verify_token_2026")
WHATSAPP_API_TOKEN = os.getenv("WHATSAPP_API_TOKEN", "")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")


def verify_webhook_handshake(mode: str, token: str, challenge: str) -> Optional[str]:
    """
    Handles Meta's initial GET verification handshake for the webhook endpoint.
    """
    if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
        return challenge
    return None


async def process_whatsapp_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parses WhatsApp Cloud API webhook JSON payload, evaluates text defensively,
    and returns formatted response.
    """
    try:
        entries = payload.get("entry", [])
        if not entries:
            return {"status": "NO_ENTRY"}

        changes = entries[0].get("changes", [])
        if not changes:
            return {"status": "NO_CHANGES"}

        value = changes[0].get("value", {})
        messages = value.get("messages", [])
        if not messages:
            return {"status": "NO_MESSAGES"}

        message = messages[0]
        sender_phone = message.get("from", "")
        message_type = message.get("type", "")

        # Extract text or audio note
        if message_type == "text":
            incoming_text = message.get("text", {}).get("body", "")
        elif message_type == "audio":
            incoming_text = "VOICE_NOTE_PLACEHOLDER: Please forward transcribed text or type offer details."
        else:
            incoming_text = ""

        if not incoming_text:
            return {"status": "EMPTY_MESSAGE"}

        # Run defensive analysis
        result = analyze_job_offer(
            incoming_text,
            community_lookup=global_reputation_store.get_reputation
        )

        formatted_reply = format_whatsapp_reply(result)

        # In production: send reply via Meta Graph API
        if WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID:
            await send_whatsapp_message(sender_phone, formatted_reply)

        return {
            "status": "PROCESSED",
            "verdict": result["verdict"],
            "score": result["score"],
            "reply_text": formatted_reply
        }
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}


def format_whatsapp_reply(result: Dict[str, Any]) -> str:
    """
    Formats the diagnostic diagnosis into an authentic, accessible WhatsApp message
    with clear visual status icons and concrete safety next steps.
    """
    verdict = result["verdict"]
    score = result["score"]
    
    icon = "🔴" if verdict == "HIGH_RISK" else "🟡" if verdict == "SUSPICIOUS" else "🟢"
    
    lines = [
        f"{icon} *SAFE JOBS SHIELD VERDICT: {verdict.replace('_', ' ')}* ({score}/100)",
        "------------------------------------",
    ]

    if result.get("is_emergency_trafficking"):
        lines.extend([
            "🚨 *CRITICAL EXPLOITATION / TRAFFICKING ALERT* 🚨",
            "This offer asks for body photos or secret overseas travel.",
            "📞 *Call National Helpline Toll-Free: 08080074* (Musasa Project)",
            "------------------------------------",
        ])

    signals = result.get("signals", [])
    if signals:
        lines.append("*⚠️ Key Red Flags Detected:*")
        for s in signals[:3]:
            lines.append(f"• {s['label']}")
    else:
        lines.append("• No critical scam red flags detected.")

    positives = result.get("positive_signals", [])
    if positives:
        lines.append("\n*✅ Positive Safety Indicators:*")
        for p in positives[:2]:
            lines.append(f"• {p['label']}")

    lines.extend([
        "\n*🛡️ Safe Next Steps:*",
        "1. NEVER pay money via EcoCash or bank transfer for uniforms/badges.",
        "2. Never share your bank PIN, OTP, or ID before an in-person interview.",
        "3. Verify employer physical premises in Harare or Bulawayo.",
        "\n_Safe Jobs Shield • Zimbabwe Youth Innovation HackLab 2026_",
        "_Privacy Protected: No raw messages stored (Cyber & Data Protection Act [12:07])_"
    ])

    return "\n".join(lines)


async def send_whatsapp_message(to_phone: str, text: str) -> bool:
    """Dispatches reply via Meta WhatsApp Cloud API endpoint."""
    url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": text},
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            return resp.status_code == 200
    except Exception:
        return False
