"""
Unit tests for privacy redaction and HMAC-SHA256 hashing.
Verifies compliance with Zimbabwe Cyber and Data Protection Act [Chapter 12:07].
"""

try:
    import pytest
except ImportError:
    pytest = None
from app.privacy import redact_pii, compute_hmac_sha256, normalize_identifier


def test_pii_redaction_masks_phone_numbers():
    raw = "Call recruiter on 0772123456 or +263 71 999 8888 for immediate job placement."
    redacted, phones, emails, urls = redact_pii(raw)
    assert "0772123456" not in redacted
    assert "+263 71 999 8888" not in redacted
    assert "[REDACTED_PHONE]" in redacted
    assert len(phones) >= 2


def test_pii_redaction_masks_emails():
    raw = "Forward CV to private.agent2026@gmail.com by tomorrow morning."
    redacted, phones, emails, urls = redact_pii(raw)
    assert "private.agent2026@gmail.com" not in redacted
    assert "[REDACTED_EMAIL:@gmail.com]" in redacted
    assert "private.agent2026@gmail.com" in emails


def test_pii_redaction_masks_national_id():
    raw = "Applicant ID number 63-1234567X89 must be provided."
    redacted, phones, emails, urls = redact_pii(raw)
    assert "63-1234567X89" not in redacted
    assert "[REDACTED_NATIONAL_ID]" in redacted


def test_hmac_hashing_consistency():
    phone1 = "+263 77 123 4567"
    phone2 = "0771234567"  # Local format of same number
    # Both normalize to '+263771234567'
    assert normalize_identifier(phone1) == normalize_identifier(phone2)
    assert compute_hmac_sha256(phone1) == compute_hmac_sha256(phone2)
    # Result must be a 64-character hex string (SHA-256)
    assert len(compute_hmac_sha256(phone1)) == 64


if __name__ == "__main__":
    test_pii_redaction_masks_phone_numbers()
    test_pii_redaction_masks_emails()
    test_pii_redaction_masks_national_id()
    test_hmac_hashing_consistency()
    print("All test_privacy assertions passed!")

