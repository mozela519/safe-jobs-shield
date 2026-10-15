"""
Unit tests for backend rules engine.
Verifies critical scam detection vectors and edge cases.
"""

try:
    import pytest
except ImportError:
    pytest = None
from app.rules import analyze_job_offer


def test_upfront_fee_detection():
    text = "OK Zimbabwe is hiring general workers! Pay $25 uniform fee via EcoCash to agent Tendai today."
    res = analyze_job_offer(text)
    assert res["verdict"] == "HIGH_RISK"
    assert any(s["id"] == "SIGNAL_UPFRONT_FEE" for s in res["signals"])
    assert res["score"] >= 70


def test_identity_theft_detection():
    text = "Send your bank card photo, national ID scan and the SMS OTP verification code before interview."
    res = analyze_job_offer(text)
    assert res["verdict"] == "HIGH_RISK"
    assert any(s["id"] == "SIGNAL_IDENTITY_THEFT" for s in res["signals"])


def test_trafficking_red_flag_detection():
    text = "Hostess in Dubai estate. Ages 19-25 only. Send 3 full body photos, waist measurements and passport scan directly to private WhatsApp."
    res = analyze_job_offer(text)
    assert res["verdict"] == "HIGH_RISK"
    assert res["is_emergency_trafficking"] is True
    assert res["helpline"] is not None
    assert res["helpline"]["number"] == "08080074"


def test_free_email_corporate_mismatch():
    text = "Delta Beverages Zimbabwe is hiring warehouse operatives. Send CV to deltabeverages.recruitment@gmail.com."
    res = analyze_job_offer(text)
    assert res["verdict"] in ["SUSPICIOUS", "HIGH_RISK"]
    assert any(s["id"] == "SIGNAL_FREE_EMAIL_MISMATCH" for s in res["signals"])


def test_legitimate_employer_rewarded():
    text = "Zambezi Digital Solutions is hiring Junior Developer. Practical test followed by panel interview at 8 Samora Machel office. We never charge fees. Apply via https://zambezidigital.co.zw/careers."
    res = analyze_job_offer(text)
    assert res["verdict"] == "LOW_RISK"
    assert any(p["id"] == "SIGNAL_NO_FEES_POLICY" for p in res["positive_signals"])
    assert res["score"] <= 30


def test_ambiguous_short_text():
    text = "Looking for shop assistant at hardware store in Chitungwiza. WhatsApp 0773991200."
    res = analyze_job_offer(text)
    assert res["verdict"] == "NOT_ENOUGH_INFO"


if __name__ == "__main__":
    test_upfront_fee_detection()
    test_identity_theft_detection()
    test_trafficking_red_flag_detection()
    test_free_email_corporate_mismatch()
    test_legitimate_employer_rewarded()
    test_ambiguous_short_text()
    print("All test_rules assertions passed!")

