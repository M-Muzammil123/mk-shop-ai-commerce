import time
from collections import defaultdict
from typing import Dict, List, Tuple


class RateLimiter:
    """
    Sliding-window in-memory rate limiter with user/IP isolation.
    """
    def __init__(self, requests_per_minute: int = 60):
        self.rpm = requests_per_minute
        self.records: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> Tuple[bool, int]:
        """
        Returns (is_allowed, remaining_requests_in_current_minute).
        """
        now = time.time()
        window_start = now - 60.0

        # Purge records older than 1 minute
        self.records[key] = [t for t in self.records[key] if t > window_start]

        if len(self.records[key]) >= self.rpm:
            return False, 0

        self.records[key].append(now)
        remaining = max(0, self.rpm - len(self.records[key]))
        return True, remaining


# Global instances
chat_rate_limiter = RateLimiter(requests_per_minute=60)
mcp_rate_limiter = RateLimiter(requests_per_minute=120)
payment_rate_limiter = RateLimiter(requests_per_minute=20)
