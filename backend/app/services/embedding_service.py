"""Embedding-based semantic search.

When an OpenAI key + the ``openai`` package are available this ranks listings
by cosine similarity between the query embedding and each listing's text
embedding (cached per process). Otherwise ``available`` is ``False`` and callers
fall back to deterministic keyword search — no key, no cost, no crash.

Cosine similarity is implemented in pure Python to avoid a numpy dependency.
"""

import math
from typing import Dict, List, Optional, Tuple

from app.config import Settings
from app.models.listing import Listing

try:  # openai is an optional dependency (poetry group "ai")
    from openai import OpenAI
except ImportError:  # pragma: no cover - depends on install profile
    OpenAI = None  # type: ignore[assignment]


def _cosine(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


class EmbeddingService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
        # cache: listing text -> embedding vector
        self._cache: Dict[str, List[float]] = {}

    @property
    def available(self) -> bool:
        return OpenAI is not None and bool(self.settings.openai_api_key)

    def _get_client(self):
        if self._client is None:
            self._client = OpenAI(api_key=self.settings.openai_api_key)
        return self._client

    def _embed(self, text: str) -> List[float]:
        if text in self._cache:
            return self._cache[text]
        resp = self._get_client().embeddings.create(
            model=self.settings.embedding_model,
            input=text,
        )
        vector = resp.data[0].embedding
        self._cache[text] = vector
        return vector

    def rank(
        self, query: str, listings: List[Listing]
    ) -> Optional[List[Tuple[Listing, float]]]:
        """Return listings sorted by semantic similarity, or ``None`` if AI is off."""
        if not self.available or not listings:
            return None
        try:
            query_vec = self._embed(query)
            scored = [
                (listing, _cosine(query_vec, self._embed(listing.search_text())))
                for listing in listings
            ]
            scored.sort(key=lambda pair: pair[1], reverse=True)
            return scored
        except Exception:
            # Any API/transport failure -> signal "unavailable" so the caller
            # falls back to deterministic search instead of erroring the request.
            return None
