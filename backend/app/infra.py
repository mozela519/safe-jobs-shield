"""
Infrastructure & External Threat Intelligence Module.
Handles domain checks, WHOIS age heuristics, and optional Google Safe Browsing/VirusTotal API integration.
"""

import os
import re
import socket
from typing import Dict, Any, Optional

GOOGLE_SAFE_BROWSING_API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")

# High-risk TLDs
HIGH_RISK_TLDS = {".xyz", ".top", ".buzz", ".work", ".click", ".loan", ".gq", ".cf", ".tk", ".ml"}


def inspect_domain_heuristics(domain: str) -> Dict[str, Any]:
    """
    Performs fast, non-blocking local domain heuristics.
    Checks DNS resolvable status, high-risk TLDs, and character spoofing.
    """
    cleaned_domain = re.sub(r"^https?://", "", domain).split("/")[0].split("?")[0].lower()
    
    # 1. High-risk TLD check
    is_high_risk_tld = any(cleaned_domain.endswith(tld) for tld in HIGH_RISK_TLDS)
    
    # 2. Brand lookalike heuristic (typosquatting on Zimbabwean brands)
    is_lookalike_econet = "econet" in cleaned_domain and not cleaned_domain.endswith("econet.co.zw")
    is_lookalike_delta = "delta" in cleaned_domain and not cleaned_domain.endswith("delta.co.zw")
    is_lookalike_zimpost = "zimpost" in cleaned_domain and not cleaned_domain.endswith("zimpost.co.zw")
    
    # 3. DNS resolution test (graceful timeout)
    dns_resolves = False
    resolved_ip = None
    try:
        resolved_ip = socket.gethostbyname(cleaned_domain)
        dns_resolves = True
    except Exception:
        dns_resolves = False

    return {
        "domain": cleaned_domain,
        "is_high_risk_tld": is_high_risk_tld,
        "is_lookalike": is_lookalike_econet or is_lookalike_delta or is_lookalike_zimpost,
        "dns_resolves": dns_resolves,
        "resolved_ip": resolved_ip,
        "whois_age_days_simulated": 14 if is_high_risk_tld else 1800,  # Simulated young domain for demo
    }


async def check_google_safe_browsing(url: str) -> Optional[Dict[str, Any]]:
    """
    Optional Google Safe Browsing lookup if API key is configured.
    Falls back gracefully if key is omitted or service is unreachable.
    """
    if not GOOGLE_SAFE_BROWSING_API_KEY:
        return {"configured": False, "status": "SKIPPED_NO_API_KEY"}

    try:
        import httpx
        endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}"
        payload = {
            "client": {"clientId": "safe-jobs-shield-zim", "clientVersion": "1.0.0"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}],
            },
        }
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(endpoint, json=payload)
            data = resp.json()
            matches = data.get("matches", [])
            return {
                "configured": True,
                "is_threat": len(matches) > 0,
                "matches": matches
            }
    except Exception as e:
        return {"configured": True, "error": str(e), "status": "LOOKUP_FAILED_FALLBACK"}


async def check_virustotal(domain: str) -> Optional[Dict[str, Any]]:
    """
    Optional VirusTotal domain lookup if API key is configured.
    Falls back gracefully if key is omitted.
    """
    if not VIRUSTOTAL_API_KEY:
        return {"configured": False, "status": "SKIPPED_NO_API_KEY"}

    try:
        import httpx
        url = f"https://www.virustotal.com/api/v3/domains/{domain}"
        headers = {"x-apikey": VIRUSTOTAL_API_KEY}
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                return {"configured": True, "malicious_votes": stats.get("malicious", 0)}
            return {"configured": True, "status": f"HTTP_{resp.status_code}"}
    except Exception as e:
        return {"configured": True, "error": str(e), "status": "LOOKUP_FAILED_FALLBACK"}
