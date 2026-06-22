"""Map link generation — no paid Google Maps APIs required.

All URLs here are keyless and safe to embed/link directly. They satisfy the
"View on Google Maps" requirement and provide a graceful imagery fallback
without the Street View Static API (which is billable).
"""

from urllib.parse import quote_plus


def google_maps_url(address: str) -> str:
    """A standard, keyless Google Maps search link for an address."""
    return f"https://www.google.com/maps/search/?api=1&query={quote_plus(address)}"


def map_embed_url(address: str) -> str:
    """A keyless embeddable map iframe URL (``output=embed``)."""
    return f"https://maps.google.com/maps?q={quote_plus(address)}&z=15&output=embed"


def street_view_url(address: str) -> str:
    """A keyless link that opens Street View panorama at the address (if any)."""
    return (
        "https://www.google.com/maps/@?api=1&map_action=pano"
        f"&viewpoint={quote_plus(address)}"
    )
