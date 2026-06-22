"""Listing models.

Two shapes are intentionally kept:

* ``OpenHouse`` — the *wire* shape returned by ``GET /open-houses``. It mirrors
  the raw Google Sheet columns exactly so the existing Next.js frontend
  contract is preserved (id, address, ..., why_pick_1/2/3, tags, status).
* ``Listing`` — the *normalized* internal shape used by search / ranking / LLM.
  ``why_picks`` is a clean list and ``tags`` is split into a list, plus map URLs.
"""

from typing import List, Optional

from pydantic import BaseModel


class OpenHouse(BaseModel):
    """Raw open-house row as returned to the frontend (stable API contract)."""

    id: int
    address: str
    area: str
    open_house_time: str
    redfin_url: str
    notes: str = ""
    price: Optional[int] = None
    # Explainable Picks fields (optional)
    why_pick_1: Optional[str] = None
    why_pick_2: Optional[str] = None
    why_pick_3: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None
    # Optional agent-written neighborhood blurb (sheet column `area_note`)
    area_note: Optional[str] = None


class Listing(BaseModel):
    """Normalized listing used internally for search and recommendations."""

    id: int
    address: str
    area: str
    open_house_time: str
    redfin_url: str
    notes: str = ""
    price: Optional[int] = None
    why_picks: List[str] = []
    tags: List[str] = []
    status: Optional[str] = None
    area_note: Optional[str] = None  # agent-written blurb from the sheet, if present
    google_maps_url: Optional[str] = None
    map_embed_url: Optional[str] = None
    street_view_url: Optional[str] = None

    def search_text(self) -> str:
        """Flatten the most semantically meaningful fields into one string."""
        parts = [
            self.address,
            self.area,
            self.open_house_time,
            self.notes,
            " ".join(self.why_picks),
            " ".join(self.tags),
        ]
        return " ".join(p for p in parts if p)
