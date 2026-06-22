"""Request/response models for the guided Q&A (`/ask`) endpoint."""

from typing import List, Optional

from pydantic import BaseModel

from app.models.listing import Listing


class AskRequest(BaseModel):
    query: str
    limit: int = 3


class ParsedFilters(BaseModel):
    """Structured criteria extracted from a natural-language query."""

    max_budget: Optional[int] = None
    min_budget: Optional[int] = None
    areas: List[str] = []
    day: Optional[str] = None
    preferences: List[str] = []


class ListingMatch(BaseModel):
    listing: Listing
    score: float
    reasons: List[str] = []


class AskResponse(BaseModel):
    answer: str
    filters: ParsedFilters
    matches: List[ListingMatch]
    used_llm: bool
    used_embeddings: bool
