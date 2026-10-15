"""
Safe Jobs Shield - Privacy-Preserving Reputation Engine.
Tracks community report counts using HMAC-SHA256 digests with time-decay and poisoning defenses.
"""

import time
import math
from typing import Dict, Any, Optional
from .privacy import compute_hmac_sha256, normalize_identifier


class ReputationStore:
    """
    In-memory / Redis-compatible reputation store for hashed identifiers.
    Guarantees that raw numbers/domains are never held in state.
    """
    def __init__(self, half_life_days: float = 14.0):
        # hashed_identifier -> {"count": int, "weighted_score": float, "last_reported": float, "categories": list}
        self.store: Dict[str, Dict[str, Any]] = {}
        # session_ip_hash -> list of timestamps (rate limiting)
        self.rate_limits: Dict[str, list] = {}
        self.half_life_seconds = half_life_days * 86400.0

    def add_report(
        self,
        identifier: str,
        category: str,
        reporter_token: str = "anon",
        current_time: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Records a community report using the HMAC-SHA256 hash.
        Enforces a rate limit (max 3 reports per hour per reporter_token) to deter bot flooding.
        """
        now = current_time or time.time()
        
        # 1. Rate Limiting Check
        reporter_hash = compute_hmac_sha256(reporter_token)
        timestamps = self.rate_limits.get(reporter_hash, [])
        # Prune older than 1 hour (3600 seconds)
        timestamps = [t for t in timestamps if now - t < 3600]
        if len(timestamps) >= 3:
            return {
                "success": False,
                "reason": "RATE_LIMIT_EXCEEDED",
                "message": "Maximum 3 reports per hour allowed to prevent abuse."
            }
        timestamps.append(now)
        self.rate_limits[reporter_hash] = timestamps

        # 2. Hashing identifier
        hashed_id = compute_hmac_sha256(identifier)

        # 3. Retrieve or initialize record
        record = self.store.get(hashed_id, {
            "raw_count": 0,
            "weighted_score": 0.0,
            "last_reported": now,
            "categories": []
        })

        # Apply exponential time decay to prior score: S_new = S_old * exp(-delta_t / tau)
        elapsed = now - record["last_reported"]
        decay_factor = math.exp(-elapsed / self.half_life_seconds) if elapsed > 0 else 1.0
        new_weighted = (record["weighted_score"] * decay_factor) + 1.0

        record["raw_count"] += 1
        record["weighted_score"] = new_weighted
        record["last_reported"] = now
        if category not in record["categories"]:
            record["categories"].append(category)

        self.store[hashed_id] = record

        return {
            "success": True,
            "hashed_identifier": hashed_id,
            "raw_count": record["raw_count"],
            "weighted_score": round(record["weighted_score"], 2)
        }

    def get_reputation(self, hashed_id: str, current_time: Optional[float] = None) -> int:
        """
        Returns the effective integer report count after applying time decay.
        """
        if hashed_id not in self.store:
            return 0
        now = current_time or time.time()
        record = self.store[hashed_id]
        elapsed = now - record["last_reported"]
        decay_factor = math.exp(-elapsed / self.half_life_seconds) if elapsed > 0 else 1.0
        decayed_score = record["weighted_score"] * decay_factor
        return int(math.floor(decayed_score))


# Global singleton instance for app lifecycle
global_reputation_store = ReputationStore()
