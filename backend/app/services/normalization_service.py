"""Listing normalization.

Turns raw Google Sheet rows into clean ``Listing`` objects:

* Derives ``why_picks`` from ``why_pick_1/2/3``; falls back to splitting
  ``notes`` into up to 3 bullets; never errors if columns are missing.
* Splits the comma-separated ``tags`` string into a list.
* Generates keyless Google Maps / Street View URLs per address.
* Enforces the "Team Listings Only" guardrail: rows whose ``status`` is set to
  anything other than ``Active`` (e.g. ``Inactive``) are dropped. Blank status
  is treated as active.
"""

import re
from typing import Any, Dict, List

from app.models.listing import Listing
from app.services import maps_service

FALLBACK_WHY = "Curated by our team based on value, location, and timing."


def _derive_why_picks(raw: Dict[str, Any]) -> List[str]:
    explicit = [raw.get(f"why_pick_{i}") for i in (1, 2, 3)]
    picks = [str(w).strip() for w in explicit if w and str(w).strip()]
    if picks:
        return picks[:3]

    notes = (raw.get("notes") or "").strip()
    if notes:
        sentences = [s.strip() for s in re.split(r"[.,;]", notes) if len(s.strip()) > 5]
        if sentences:
            return sentences[:3]
    return []


def _split_tags(raw: Dict[str, Any]) -> List[str]:
    return [t.strip() for t in (raw.get("tags") or "").split(",") if t.strip()]


def _is_active(raw: Dict[str, Any]) -> bool:
    status = (raw.get("status") or "").strip().lower()
    return status in ("", "active")


def normalize(raw: Dict[str, Any]) -> Listing:
    address = raw.get("address", "")
    return Listing(
        id=raw.get("id", 0),
        address=address,
        area=raw.get("area", ""),
        open_house_time=raw.get("open_house_time", ""),
        redfin_url=raw.get("redfin_url", ""),
        notes=raw.get("notes", "") or "",
        price=raw.get("price"),
        why_picks=_derive_why_picks(raw),
        tags=_split_tags(raw),
        status=raw.get("status") or None,
        google_maps_url=maps_service.google_maps_url(address) if address else None,
        map_embed_url=maps_service.map_embed_url(address) if address else None,
        street_view_url=maps_service.street_view_url(address) if address else None,
    )


def normalize_many(rows: List[Dict[str, Any]]) -> List[Listing]:
    """Normalize and apply the Active-only guardrail."""
    return [normalize(r) for r in rows if _is_active(r)]
