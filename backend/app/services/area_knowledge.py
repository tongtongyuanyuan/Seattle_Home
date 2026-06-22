"""Factual neighborhood notes — a tiny, hand-curated knowledge base.

At ~10–30 listings this replaces RAG / embeddings: a simple dict lookup by area
gives the LLM grounded, neutral context (commute, transit, schools, character)
without a vector database. Keep entries factual and Fair-Housing-safe — no
investment promises, no steering language.
"""

from typing import Dict, List, Optional

# Keys are lowercase area / city names, matched loosely (substring) so a listing
# whose area is "Renton Highlands" still resolves to the Renton note.
AREA_NOTES: Dict[str, str] = {
    "bellevue": "Eastside hub with well-regarded schools and strong resale; quick I-405 / SR-520 access to tech employers.",
    "somerset": "Hillside Bellevue neighborhood — quiet, territorial and mountain views, Bellevue School District.",
    "factoria": "South Bellevue shopping/commute hub at the I-90 / I-405 junction; convenient in both directions.",
    "renton": "Value-friendly south Eastside; I-405 access and a growing downtown, roughly 25–30 min to Seattle or Bellevue.",
    "renton highlands": "East Renton — more space for the price, near the Highlands shops and SR-900.",
    "newcastle": "Between Bellevue and Renton; quiet streets, golf and greenbelt, short Eastside commute.",
    "kirkland": "Lake Washington waterfront and walkable downtown; Cross Kirkland Corridor trail, I-405 / SR-520 access.",
    "redmond": "Eastside tech center (Microsoft); Link light rail extension, family-friendly with well-regarded schools.",
    "issaquah": "Foothills community with highly-rated schools and trail access; I-90 commute.",
    "sammamish": "Plateau suburb east of Bellevue; spacious lots and strong schools, with a longer commute.",
    "bothell": "Northeast suburb with a revitalized downtown and UW Bothell; I-405 access, family-friendly.",
    "kenmore": "North end of Lake Washington; quieter, on the Burke-Gilman trail, commuter access to the Eastside.",
    "mercer island": "Island between Seattle and Bellevue; well-regarded schools and a direct I-90 commute, premium pricing.",
    "lynnwood": "North King / Snohomish; Link light rail (Lynnwood City Center) plus easy I-5 / I-405.",
    "shoreline": "Close-in north of Seattle; Link light rail stations and the Shoreline School District.",
    "edmonds": "Walkable waterfront town north of Seattle; ferry, Sounder rail, small-town feel.",
    "queen anne": "In-city Seattle; walkable, hilltop views, close to downtown and Seattle Center.",
    "ballard": "Northwest Seattle; walkable, restaurants and breweries, light-rail expansion planned.",
    "fremont": "Central Seattle; quirky and walkable, near tech offices and the Burke-Gilman trail.",
    "capitol hill": "Dense, walkable in-city Seattle; nightlife and light rail, limited parking.",
    "west seattle": "Peninsula with beaches and skyline views; water-taxi and bus commute downtown.",
    "south seattle": "Diverse and more affordable in-city; light rail along MLK Jr Way, quick downtown access.",
    "north seattle": "Established residential neighborhoods; parks, with light-rail access expanding north.",
    "university district": "Around UW; transit-rich with light rail, busy and walkable.",
    "seattle downtown": "Urban core — most walkable and transit-rich, condo-heavy, premium pricing.",
    "seattle": "Urban core — walkable neighborhoods and transit, with premium pricing closer in.",
}


def notes_for(area: Optional[str]) -> Optional[str]:
    """Return a factual note for an area / city name, or ``None``."""
    key = (area or "").strip().lower()
    if not key:
        return None
    if key in AREA_NOTES:
        return AREA_NOTES[key]
    # Loose match so "Renton Highlands" -> "renton", "Bellevue 98006" -> "bellevue".
    for name, note in AREA_NOTES.items():
        if name in key or key in name:
            return note
    return None


def notes_for_listings(listings: List) -> Dict[str, str]:
    """Map each distinct listing area to its note (deduped, known areas only).

    Prefers an agent-written ``area_note`` on the listing (from the sheet) and
    falls back to the built-in defaults.
    """
    out: Dict[str, str] = {}
    for listing in listings:
        area = getattr(listing, "area", "") or ""
        if area in out:
            continue
        note = getattr(listing, "area_note", None) or notes_for(area)
        if note:
            out[area] = note
    return out
