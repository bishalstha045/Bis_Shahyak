import time
from typing import Dict, Any, Optional

class QueryCache:
    def __init__(self, ttl: int = 86400):
        self.ttl = ttl
        self._cache: Dict[str, Dict[str, Any]] = {}

    def _make_key(self, query: str, mode: str, language: str, sector: Optional[str]) -> str:
        q_norm = query.strip().lower()
        return f"{q_norm}|{mode}|{language}|{sector or 'all'}"

    def get(self, query: str, mode: str = "simple", language: str = "auto", sector: Optional[str] = None) -> Optional[Dict[str, Any]]:
        key = self._make_key(query, mode, language, sector)
        entry = self._cache.get(key)
        if entry:
            if time.time() - entry["timestamp"] < self.ttl:
                return entry["data"]
            else:
                del self._cache[key]
        return None

    def set(self, query: str, data: Dict[str, Any], mode: str = "simple", language: str = "auto", sector: Optional[str] = None):
        key = self._make_key(query, mode, language, sector)
        self._cache[key] = {
            "timestamp": time.time(),
            "data": data
        }

query_cache = QueryCache()
