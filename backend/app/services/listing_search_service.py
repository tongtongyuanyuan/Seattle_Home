"""Structured + semantic search over team listings.

This is the deterministic core that powers the guided Q&A. It:

1. Parses a natural-language query into structured ``ParsedFilters``
   (budget, areas, day, preferences) using simple, dependency-free rules.
2. Filters listings by those criteria.
3. Scores/ranks the candidates. If the optional embedding service is available
   it reranks semantically; otherwise it uses a transparent keyword score.

Everything works with no API keys. Embeddings only *improve* ranking.
"""

import re
from typing import List, Optional, Tuple

from app.models.listing import Listing
from app.models.search import ListingMatch, ParsedFilters
from app.services.embedding_service import EmbeddingService

# Known Seattle-area locations we match against the query / listing area.
KNOWN_AREAS = [
    "seattle",
    "bellevue",
    "kirkland",
    "redmond",
    "issaquah",
    "renton",
    "mercer island",
    "sammamish",
    "eastside",
    "north seattle",
    "downtown",
    "queen anne",
]

# Preference keyword -> synonyms that may appear in the query or listing text.
PREFERENCE_SYNONYMS = {
    "schools": ["school", "schools", "education", "district"],
    "commute": ["commute", "transit", "light rail", "lightrail", "train", "bus"],
    "value": ["value", "below median", "affordable", "deal", "under budget"],
    "views": ["view", "views", "lake", "waterfront", "water"],
    "quiet": ["quiet", "peaceful", "cul-de-sac", "cul de sac"],
}


def _parse_budget(query: str) -> Tuple[Optional[int], Optional[int]]:
    """Extract a max (and optionally min) budget in dollars from the query."""
    text = query.lower()
    max_budget: Optional[int] = None
    min_budget: Optional[int] = None

    # Patterns like "900k", "$1.2m", "1,200,000"
    def to_dollars(num: str, suffix: str) -> int:
        value = float(num.replace(",", ""))
        if suffix == "k":
            value *= 1_000
        elif suffix == "m":
            value *= 1_000_000
        return int(value)

    money = re.findall(r"\$?\s*([\d,]+(?:\.\d+)?)\s*(k|m)?", text)
    money = [(n, s) for n, s in money if n.replace(",", "").strip()]

    for keyword in ("under", "below", "less than", "max", "up to", "<"):
        m = re.search(rf"{keyword}\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(k|m)?", text)
        if m:
            max_budget = to_dollars(m.group(1), m.group(2) or "")
            break

    for keyword in ("over", "above", "more than", "min", "at least", ">"):
        m = re.search(rf"{keyword}\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(k|m)?", text)
        if m:
            min_budget = to_dollars(m.group(1), m.group(2) or "")
            break

    # Bare amount with a 'k'/'m' suffix and no explicit comparator -> treat as max.
    if max_budget is None and min_budget is None:
        for num, suffix in money:
            if suffix in ("k", "m"):
                max_budget = to_dollars(num, suffix)
                break

    return min_budget, max_budget


def parse_query(query: str) -> ParsedFilters:
    text = query.lower()
    min_budget, max_budget = _parse_budget(query)

    areas = [a for a in KNOWN_AREAS if a in text]

    day: Optional[str] = None
    if re.search(r"\bsat(urday)?\b", text):
        day = "Saturday"
    elif re.search(r"\bsun(day)?\b", text):
        day = "Sunday"

    preferences = [
        pref
        for pref, synonyms in PREFERENCE_SYNONYMS.items()
        if any(s in text for s in synonyms)
    ]

    return ParsedFilters(
        max_budget=max_budget,
        min_budget=min_budget,
        areas=areas,
        day=day,
        preferences=preferences,
    )


def _matches_filters(listing: Listing, filters: ParsedFilters) -> bool:
    if filters.max_budget is not None and listing.price is not None:
        if listing.price > filters.max_budget:
            return False
    if filters.min_budget is not None and listing.price is not None:
        if listing.price < filters.min_budget:
            return False
    if filters.areas:
        haystack = f"{listing.area} {listing.address}".lower()
        if not any(area in haystack for area in filters.areas):
            return False
    if filters.day and filters.day.lower() not in listing.open_house_time.lower():
        return False
    return True


def _keyword_score(listing: Listing, filters: ParsedFilters) -> Tuple[float, List[str]]:
    """Transparent fallback score + human-readable reasons."""
    score = 0.0
    reasons: List[str] = []
    text = listing.search_text().lower()

    for pref in filters.preferences:
        if any(s in text for s in PREFERENCE_SYNONYMS[pref]):
            score += 1.0
            reasons.append(f"Matches your interest in {pref}")

    if filters.areas:
        if any(a in f"{listing.area} {listing.address}".lower() for a in filters.areas):
            score += 1.0
            reasons.append(f"In your preferred area ({listing.area})")

    if filters.max_budget and listing.price:
        score += 0.5
        reasons.append(f"Within budget at ${listing.price:,}")

    # Seed reasons from the listing's own "why we picked this" bullets.
    for why in listing.why_picks[:2]:
        reasons.append(why)

    return score, reasons[:3]


def search(
    listings: List[Listing],
    query: str,
    embedding_service: Optional[EmbeddingService] = None,
    limit: int = 3,
) -> Tuple[ParsedFilters, List[ListingMatch], bool]:
    """Return parsed filters, ranked matches, and whether embeddings were used."""
    filters = parse_query(query)

    candidates = [l for l in listings if _matches_filters(l, filters)]
    broadened = False
    if not candidates:
        # No exact matches -> suggest closest picks by broadening to all listings.
        candidates = list(listings)
        broadened = True

    used_embeddings = False
    ranked: List[ListingMatch] = []

    semantic = embedding_service.rank(query, candidates) if embedding_service else None
    if semantic is not None:
        used_embeddings = True
        for listing, sim in semantic[:limit]:
            _, reasons = _keyword_score(listing, filters)
            if not reasons:
                reasons = listing.why_picks[:2]
            ranked.append(ListingMatch(listing=listing, score=round(sim, 4), reasons=reasons))
    else:
        scored = [(l, *_keyword_score(l, filters)) for l in candidates]
        scored.sort(key=lambda t: t[1], reverse=True)
        for listing, score, reasons in scored[:limit]:
            ranked.append(ListingMatch(listing=listing, score=score, reasons=reasons))

    if broadened:
        for match in ranked:
            match.reasons = ["Closest match — try broadening your filters"] + match.reasons
    return filters, ranked, used_embeddings
