"""
Privacy & Cryptographic Sanitization Module.
Aligned with Zimbabwe Cyber and Data Protection Act [Chapter 12:07].
"""

import os
import re
import hmac
import hashlib
from typing import Tuple, List, Dict, Any

# Secret pepper loaded strictly from environment variable
PEPPER = os.getenv("SJS_PEPPER", "ZIM_SJS_DEFENSIVE_SALT_2026_HACKLAB").encode("utf-8")


def normalize_identifier(identifier: str) -> str:
    """
    Standardizes a phone number or domain string prior to cryptographic hashing.
    Converts Zimbabwean phone numbers to E.164 (+263...) format.
    """
    cleaned = identifier.strip().lower()
    # Strip protocol and query params for domains
    cleaned = re.sub(r"^https?://", "", cleaned)
    cleaned = re.sub(r"^www\.", "", cleaned).split("/")[0].split("?")[0]
    
    # Strip whitespace, dashes, parens
    cleaned = re.sub(r"[\s\-_()]", "", cleaned)
    
    # Zimbabwean mobile normalization
    if cleaned.startswith("07") and len(cleaned) == 10:
        cleaned = "+263" + cleaned[1:]
    elif cleaned.startswith("263") and not cleaned.startswith("+"):
        cleaned = "+" + cleaned
        
    return cleaned


def compute_hmac_sha256(identifier: str) -> str:
    """
    Computes an irreversible HMAC-SHA256 digest using the secret environment pepper.
    Raw phone numbers and domains are discarded immediately after this computation.
    """
    normalized = normalize_identifier(identifier).encode("utf-8")
    return hmac.new(PEPPER, normalized, hashlib.sha256).hexdigest()


def redact_pii(text: str) -> Tuple[str, List[str], List[str], List[str]]:
    """
    Redacts personally identifiable information (phone numbers, emails, national IDs)
    before any internal logging, queue dispatch, or third-party API call (e.g. LLM).
    Returns (sanitized_text, found_phones, found_emails, found_urls).
    """
    found_phones: List[str] = []
    found_emails: List[str] = []
    found_urls: List[str] = []

    # 1. Collect Emails first
    email_regex = re.compile(r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})", re.IGNORECASE)
    for m in email_regex.finditer(text):
        found_emails.append(m.group(1))

    # 2. Collect URLs that are not part of an email domain
    url_regex = re.compile(
        r"(https?://[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:co\.zw|org\.zw|com|net|org|xyz|top|biz|info|site|online|me)(?:/[^\s]*)?)",
        re.IGNORECASE
    )
    for m in url_regex.finditer(text):
        raw_u = m.group(1)
        if not any(raw_u in e for e in found_emails):
            found_urls.append(raw_u)

    redacted = text

    # Perform URL replacements
    for u in sorted(set(found_urls), key=len, reverse=True):
        host = re.sub(r"^https?://", "", u, flags=re.IGNORECASE).split("/")[0]
        redacted = redacted.replace(u, f"[REDACTED_URL:{host}]")

    # Perform Email replacements
    for e in sorted(set(found_emails), key=len, reverse=True):
        domain = e.split("@")[1] if "@" in e else "email"
        redacted = redacted.replace(e, f"[REDACTED_EMAIL:@{domain}]")

    # 3. Match Phone Numbers (Zimbabwean +263, 07..., international +27, +44, etc.)
    phone_regex = re.compile(
        r"(\+?(?:263|27|254|44|1)[\s-]?(?:\(0\))?[\s-]?[0-9]{2,4}[\s-]?[0-9]{3,4}[\s-]?[0-9]{3,4}|07[1378][0-9]{7}|0[1-9][0-9]{1,2}[\s-]?[0-9]{5,7})",
        re.IGNORECASE
    )
    def replace_phone(match):
        raw = match.group(1)
        cleaned = re.sub(r"[\s-]", "", raw)
        if len(cleaned) >= 7:
            found_phones.append(raw.strip())
            return "[REDACTED_PHONE]"
        return raw
    redacted = phone_regex.sub(replace_phone, redacted)

    # 4. Match Zimbabwean National ID patterns (e.g., 63-1234567-X-89 or 63-1234567X89)
    nat_id_regex = re.compile(r"\b\d{2}-\d{6,7}[A-Z]\d{2}\b", re.IGNORECASE)
    redacted = nat_id_regex.sub("[REDACTED_NATIONAL_ID]", redacted)

    return (
        redacted,
        list(set(found_phones)),
        list(set(found_emails)),
        list(set(found_urls))
    )


class RetentionManager:
    """
    Handles periodic purging of ephemeral reputation counters and logs
    to comply with Section 16 (Right to Erasure & Limited Retention) of the
    Zimbabwe Cyber and Data Protection Act [Chapter 12:07].
    """
    def __init__(self, max_retention_days: int = 30):
        self.max_retention_days = max_retention_days

    def purge_expired_records(self, record_store: Dict[str, Any], current_timestamp: float) -> int:
        """Purges any record exceeding max retention window."""
        cutoff = current_timestamp - (self.max_retention_days * 86400)
        keys_to_delete = [
            k for k, v in record_store.items()
            if isinstance(v, dict) and v.get("timestamp", 0) < cutoff
        ]
        for k in keys_to_delete:
            del record_store[k]
        return len(keys_to_delete)
