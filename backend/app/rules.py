"""
Safe Jobs Shield - Deterministic Defensive Rules Engine (Python Port).
Zimbabwe Youth Innovation HackLab 2026.
Defensive, diagnostic classification with zero accusatory language.
"""

import re
from typing import Dict, List, Any, Optional
from .privacy import redact_pii, compute_hmac_sha256

# Known free email providers
FREE_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "protonmail.com", "aol.com", "yandex.com", "mail.com"
}

# Suspicious TLDs
SUSPICIOUS_TLDS = {".xyz", ".top", ".buzz", ".work", ".click", ".loan", ".gq", ".cf", ".tk", ".ml"}

# URL shorteners
URL_SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "shorturl.at", "rb.gy"}

# Zimbabwean official second-level domains
OFFICIAL_ZIM_DOMAINS = {".co.zw", ".org.zw", ".ac.zw", ".gov.zw"}

# National Helpline
ZIM_TRAFFICKING_HELPLINE = {
    "name": "Zimbabwe National Anti-Trafficking & GBV Helpline (Musasa Project & CID)",
    "number": "08080074",
    "toll_free": True,
    "hours": "24/7",
    "description": "Confidential toll-free line for youth facing forced travel, domestic servitude, or physical exploitation."
}


def analyze_job_offer(
    text: str,
    community_lookup: Optional[Any] = None,
    verified_registry: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Evaluates a job message against weighted defensive indicators.
    Returns structured diagnosis dictionary matching the web demo schema.
    """
    trimmed = text.strip()
    lower = trimmed.lower()
    words = [w for w in re.split(r"\s+", trimmed) if w]

    # Redact PII
    redacted_text, found_phones, found_emails, found_urls = redact_pii(text)

    # Compute HMAC hashes of identifiers
    hashed_identifiers = []
    for p in found_phones:
        hashed_identifiers.append({"type": "phone", "hash": compute_hmac_sha256(p), "redacted": p})
    for u in found_urls:
        domain = re.sub(r"^https?://", "", u, flags=re.IGNORECASE).split("/")[0].lower()
        hashed_identifiers.append({"type": "domain", "hash": compute_hmac_sha256(domain), "redacted": domain})
    for e in found_emails:
        domain = e.split("@")[1].lower() if "@" in e else e.lower()
        hashed_identifiers.append({"type": "email", "hash": compute_hmac_sha256(domain), "redacted": domain})

    # Employer Registry Check
    matched_employer = None
    if verified_registry:
        for emp in verified_registry:
            emp_dom = emp.get("domain", "").lower()
            emp_name = emp.get("name", "").lower()
            if any(emp_dom in u.lower() for u in found_urls) or any(emp_dom in em.lower() for em in found_emails):
                matched_employer = emp
                break
            if emp_name in lower and not any(any(f in em.lower() for f in FREE_EMAIL_DOMAINS) for em in found_emails):
                matched_employer = emp
                break

    # Quick check for ambiguous low-information input
    has_actionable_signals = len(found_emails) > 0 or len(found_urls) > 0 or _has_high_risk_keywords(lower)
    if len(words) < 15 and not has_actionable_signals and matched_employer is None:
        return _create_not_enough_info_result(redacted_text, found_phones, found_emails, found_urls)

    signals: List[Dict[str, Any]] = []
    positive_signals: List[Dict[str, Any]] = []

    # 1. UPFRONT FEE SIGNALS (Weight: +72)
    fee_regex = re.compile(
        r"\b(fee|fees|registration fee|uniform fee|medical fee|processing fee|badge fee|deposit|pay today|bhadhara|mari ye|mari yekupinda|ecocash|mukuru|western union|application fee|interview fee|training fee|consultancy fee)\b",
        re.IGNORECASE
    )
    monetary_regex = re.compile(r"(\$\s*\d+|\d+\s*(?:usd|rtgs|zig|dollars|bucks|rand))\b", re.IGNORECASE)
    if fee_regex.search(lower) and (monetary_regex.search(lower) or re.search(r"\b(pay|bhadhara|send|deposit)\b", lower, re.IGNORECASE)):
        signals.append({
            "id": "SIGNAL_UPFRONT_FEE",
            "category": "fee",
            "severity": "critical",
            "weight": 72,
            "label": "Upfront Payment or Processing Fee Demanded",
            "description": "The offer demands money for registration, uniform, badges, or processing. Legitimate employers in Zimbabwe never charge candidates to work."
        })

    # 2. IDENTITY, BANK PIN & OTP THEFT (Weight: +74)
    id_theft_regex = re.compile(
        r"\b(bank pin|otp|security code|bank card|cvv|national id copy|send passport scan|original passport|id front and back|atm pin)\b",
        re.IGNORECASE
    )
    if id_theft_regex.search(lower):
        signals.append({
            "id": "SIGNAL_IDENTITY_THEFT",
            "category": "identity",
            "severity": "critical",
            "weight": 74,
            "label": "Sensitive Credentials, Bank PIN or OTP Requested",
            "description": "Requests for bank card photos, OTP verification codes, bank PINs, or original passports before an in-person interview is a hallmark of identity fraud."
        })

    # 3. FREE EMAIL FOR CORPORATE ROLE (Weight: +22)
    uses_free_email = any(e.split("@")[1].lower() in FREE_EMAIL_DOMAINS for e in found_emails if "@" in e)
    claims_corp = bool(re.search(r"\b(ltd|limited|plc|pvt|corp|bank|ministry|un\b|united nations|econet|delta|innscor|ngo|council|government|embassy)\b", lower, re.IGNORECASE))
    if uses_free_email and (claims_corp or re.search(r"\b(careers|hr|recruitment|official)\b", lower, re.IGNORECASE)):
        signals.append({
            "id": "SIGNAL_FREE_EMAIL_MISMATCH",
            "category": "contact",
            "severity": "high",
            "weight": 22,
            "label": "Free Email Address Used for Corporate / Formal Role",
            "description": "The recruiter claims corporate standing but uses a free public email provider (@gmail, @yahoo, @outlook) instead of a verified enterprise domain."
        })

    # 4. URGENCY & PRESSURE (Weight: +15)
    urgency_regex = re.compile(
        r"\b(act now|urgent|immediately|pay today|limited slots|few slots remaining|offer expires today|only 15 places|before midnight|nekukasika|usanonoke|nhasi chete)\b",
        re.IGNORECASE
    )
    if urgency_regex.search(lower):
        signals.append({
            "id": "SIGNAL_URGENCY_PRESSURE",
            "category": "urgency",
            "severity": "medium",
            "weight": 15,
            "label": "High-Pressure Urgency Tactics",
            "description": "Invented artificial deadlines ('slots close today') are deployed to rush candidates before they can verify the offer."
        })

    # 5. UNREALISTIC SALARY / OVERSEAS (Weight: +26)
    unrealistic_sal = re.compile(r"(\$\s*(?:[3-9],\d{3}|\d{5,})|(?:3|4|5|6|7|8|9|10),\d{3}\s*(?:usd|dollars)|unrealistic salary)", re.IGNORECASE)
    overseas_vague = re.compile(r"\b(canada|poland|dubai|qatar|kuwait|uk|australia|overseas|visa sponsor|no ielts|no experience needed)\b", re.IGNORECASE)
    if unrealistic_sal.search(lower) or (overseas_vague.search(lower) and re.search(r"\b(fruit picker|cleaner|general worker|farm driver|packer)\b", lower, re.IGNORECASE)):
        signals.append({
            "id": "SIGNAL_UNREALISTIC_OVERSEAS_PROMISE",
            "category": "salary",
            "severity": "high",
            "weight": 26,
            "label": "Exaggerated Salary or Vague Overseas Placement",
            "description": "Promises of thousands of dollars abroad for entry-level work without qualifications is a standard deceptive bait."
        })

    # 6. SECRECY & PRIVATE CHAT (Weight: +22)
    secrecy_regex = re.compile(
        r"\b(strictly between us|keep this secret|musaudza vamwe|don't tell anyone|private whatsapp only|ungatsheli muntu|inbox me privately|secret vacancy|do not call office)\b",
        re.IGNORECASE
    )
    if secrecy_regex.search(lower):
        signals.append({
            "id": "SIGNAL_SECRECY_PRIVATE_CHAT",
            "category": "privacy",
            "severity": "high",
            "weight": 22,
            "label": "Secrecy Request & Informal Private Chat Routing",
            "description": "Demanding secrecy or prohibiting contact with the physical office bypasses institutional employment checks."
        })

    # 7. EXPLOITATION & TRAFFICKING (Weight: +85)
    trafficking_regex = re.compile(
        r"\b(body photos|full body photos|waist measurements|measurements|ages 19-27 only|flight tickets directly|private estate|hostess|domestic assistant.*dubai|surrender passport|confiscate)\b",
        re.IGNORECASE
    )
    is_trafficking = bool(trafficking_regex.search(lower))
    if is_trafficking:
        signals.append({
            "id": "SIGNAL_TRAFFICKING_EXPLOITATION_RISK",
            "category": "trafficking",
            "severity": "critical",
            "weight": 85,
            "label": "CRITICAL: Severe Exploitation or Human Trafficking Indicators",
            "description": "Requests for body photos, physical measurements, or private ticket handling without licensed travel agencies are documented trafficking patterns."
        })

    # 8. SUSPICIOUS LINKS & LOOKALIKE DOMAINS (Weight: +28)
    for u in found_urls:
        u_lower = u.lower()
        is_shortener = any(s in u_lower for s in URL_SHORTENERS)
        is_bad_tld = any(tld in u_lower for tld in SUSPICIOUS_TLDS)
        is_lookalike = ("econet" in u_lower and "econet.co.zw" not in u_lower) or ("delta" in u_lower and "delta.co.zw" not in u_lower)
        if is_shortener or is_bad_tld or is_lookalike:
            signals.append({
                "id": "SIGNAL_SUSPICIOUS_DOMAIN_OR_SHORTENER",
                "category": "link",
                "severity": "high",
                "weight": 28,
                "label": "Suspicious Domain, Shortened Link, or Lookalike URL",
                "description": f"Detected link ({u}) uses an unusual TLD, URL shortener, or brand lookalike."
            })
            break

    # 9. REPUTATION COMMUNITY COUNTER
    if community_lookup:
        max_reports = 0
        for h in hashed_identifiers:
            c = community_lookup(h["hash"])
            if c > max_reports:
                max_reports = c
        if max_reports > 0:
            penalty = min(30, max_reports * 10)
            signals.append({
                "id": "SIGNAL_COMMUNITY_FLAGGED_REPUTATION",
                "category": "reputation",
                "severity": "high",
                "weight": penalty,
                "label": f"Identifier Previously Flagged by Community ({max_reports} reports)",
                "description": f"The cryptographic hash of this recruiter contact matches {max_reports} fraud flags in the reputation pool."
            })

    # 10. POSITIVE LEGITIMACY SIGNALS
    no_fees_regex = re.compile(
        r"\b(never (?:requests?|charges?)|do(?:es)? not charge|no fees are charged|strictly no agency fees|equal opportunity employer|free of charge)\b",
        re.IGNORECASE
    )
    if no_fees_regex.search(lower):
        positive_signals.append({
            "id": "SIGNAL_NO_FEES_POLICY",
            "category": "legitimacy",
            "severity": "positive",
            "weight": -20,
            "label": "Explicit Zero-Fee Recruitment Policy",
            "description": "The employer explicitly commits to charging no recruitment or training fees."
        })

    structured_interview = re.compile(
        r"\b(panel interview|in-person|practical test|coding test|aptitude test|physical workshop|boardroom|head office)\b",
        re.IGNORECASE
    )
    if structured_interview.search(lower):
        positive_signals.append({
            "id": "SIGNAL_STRUCTURED_INTERVIEW_PROCESS",
            "category": "legitimacy",
            "severity": "positive",
            "weight": -15,
            "label": "Structured Multi-Stage Interview Process",
            "description": "Details formal candidate evaluation rather than instant WhatsApp hiring."
        })

    has_zim_domain = any(any(d in u.lower() for d in OFFICIAL_ZIM_DOMAINS) for u in found_urls) or \
                     any(any(d in em.lower() for d in OFFICIAL_ZIM_DOMAINS) for em in found_emails)
    if has_zim_domain:
        positive_signals.append({
            "id": "SIGNAL_OFFICIAL_ZIM_DOMAIN",
            "category": "legitimacy",
            "severity": "positive",
            "weight": -18,
            "label": "Registered Zimbabwean Domain (.co.zw / .org.zw)",
            "description": "Communication routes through a recognized Zimbabwean domain name."
        })

    if matched_employer:
        positive_signals.append({
            "id": "SIGNAL_MATCHED_VERIFIED_EMPLOYER",
            "category": "legitimacy",
            "severity": "positive",
            "weight": -30,
            "label": f"Verified Employer: {matched_employer.get('name')}",
            "description": "Identified as a formally registered enterprise in the Safe Jobs Shield registry."
        })

    # Inconclusive check
    if not signals and not positive_signals and matched_employer is None:
        return _create_not_enough_info_result(redacted_text, found_phones, found_emails, found_urls)

    # Score summation
    total_score = sum(s["weight"] for s in signals) + sum(p["weight"] for p in positive_signals)
    if not signals and positive_signals:
        total_score = max(5, min(20, total_score))
    elif signals and not positive_signals:
        total_score = max(35, total_score)

    total_score = max(0, min(100, int(round(total_score))))
    if is_trafficking:
        total_score = max(82, total_score)

    verdict = "HIGH_RISK" if total_score >= 70 else "SUSPICIOUS" if total_score >= 30 else "LOW_RISK"

    return {
        "score": total_score,
        "verdict": verdict,
        "signals": signals,
        "positive_signals": positive_signals,
        "is_emergency_trafficking": is_trafficking,
        "helpline": ZIM_TRAFFICKING_HELPLINE if is_trafficking else None,
        "redacted_text": redacted_text,
        "entities": {
            "phones": found_phones,
            "emails": found_emails,
            "urls": found_urls,
            "hashed_identifiers": hashed_identifiers
        },
        "matched_employer": matched_employer
    }


def _has_high_risk_keywords(text: str) -> bool:
    return bool(re.search(r"\b(fee|fees|pay|ecocash|usd|bhadhara|deposit|passport|waist|measurements|dubai|pin|otp)\b", text, re.IGNORECASE))


def _create_not_enough_info_result(redacted_text: str, phones: List[str], emails: List[str], urls: List[str]) -> Dict[str, Any]:
    return {
        "score": 15,
        "verdict": "NOT_ENOUGH_INFO",
        "signals": [],
        "positive_signals": [],
        "is_emergency_trafficking": False,
        "helpline": None,
        "redacted_text": redacted_text,
        "entities": {
            "phones": phones,
            "emails": emails,
            "urls": urls,
            "hashed_identifiers": []
        },
        "matched_employer": None
    }
