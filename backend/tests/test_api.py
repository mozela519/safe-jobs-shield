"""
Unit tests for FastAPI endpoints.
Tests /health, /check, /report, /employers, and rate limiting.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Zimbabwe Cyber and Data Protection Act" in data["regulatory_alignment"]


def test_check_endpoint_scam():
    payload = {
        "message": "Hiring 20 packers! Pay $25 uniform fee via EcoCash to 0779123456 before 5pm.",
        "language": "en"
    }
    response = client.post("/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "HIGH_RISK"
    assert data["score"] >= 70
    assert "[REDACTED_PHONE]" in data["redacted_text"]


def test_check_endpoint_legitimate():
    payload = {
        "message": "Zambezi Digital Solutions is hiring Junior Developer. In-person interview at 8 Samora Machel Avenue. No fees at any stage. Apply at https://zambezidigital.co.zw/careers.",
        "language": "en"
    }
    response = client.post("/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "LOW_RISK"
    assert data["score"] <= 30


def test_report_endpoint_and_rate_limit():
    reporter = "test_user_session_abc"
    # First 3 submissions should succeed
    for i in range(3):
        res = client.post("/report", json={
            "identifier": f"+263 77 111 22{i}{i}",
            "category": "advance_fee",
            "reporter_token": reporter
        })
        assert res.status_code == 200
        assert res.json()["success"] is True

    # 4th submission should trigger rate limit (HTTP 429)
    res4 = client.post("/report", json={
        "identifier": "+263 77 999 8888",
        "category": "advance_fee",
        "reporter_token": reporter
    })
    assert res4.status_code == 429
