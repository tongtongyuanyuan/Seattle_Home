"""LLM recommendation response (Anthropic Claude).

Produces the natural-language answer shown for a `/ask` query, grounded ONLY in
the team's matched listings plus factual neighborhood notes.

* With an ANTHROPIC_API_KEY + the ``anthropic`` package: a warm, concise answer
  from Claude, constrained to the provided homes and area notes, with
  Fair-Housing / no-investment-guarantee guardrails.
* Without them: a clean deterministic template built from the same matches
  (which still appends the neighborhood note).

Either way the answer references only real listings — there is no open-ended
chatbot behaviour.
"""

import logging
from typing import List

from app.config import Settings
from app.models.search import ListingMatch, ParsedFilters
from app.services import area_knowledge

try:  # anthropic is an optional dependency (poetry group "ai")
    import anthropic
except ImportError:  # pragma: no cover - depends on install profile
    anthropic = None  # type: ignore[assignment]

logger = logging.getLogger("uvicorn.error")

SYSTEM_PROMPT = (
    "You are a warm, concise assistant for a small Seattle real-estate team. "
    "You may ONLY discuss the specific team listings given to you, and you may use "
    "the provided neighborhood notes for context. Never invent homes, prices, "
    "schools, or facts that are not provided.\n\n"
    "Compliance (important):\n"
    "- Do NOT guarantee or promise investment returns or future property values.\n"
    "- Do NOT steer buyers toward or away from areas based on protected classes "
    "(race, color, religion, national origin, sex, disability, familial status). "
    "Keep school and neighborhood comments factual and neutral.\n"
    "- If the matches are weak or you are unsure, say so and suggest broadening.\n\n"
    "Answer in 2–4 short sentences, refer to homes by their address, and close with "
    "a brief reminder that the team can confirm details and schedule a tour."
)

# Friendly one-liner shown if the model declines to answer (rare on real-estate
# questions) — keep it light and redirect, don't dump a robotic fallback.
REFUSAL_REPLY = (
    "I can only help with our team's curated Seattle home picks 🏡 — try asking "
    "about budget, area, schools, or this weekend's open houses!"
)


class LLMService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None

    @property
    def available(self) -> bool:
        return anthropic is not None and bool(self.settings.anthropic_api_key)

    def _get_client(self):
        if self._client is None:
            self._client = anthropic.Anthropic(api_key=self.settings.anthropic_api_key)
        return self._client

    # -- deterministic fallback -------------------------------------------
    @staticmethod
    def _template(query: str, matches: List[ListingMatch]) -> str:
        if not matches:
            return (
                "I couldn't find a team pick matching that yet. Try broadening "
                "your budget or area, and I'll show the closest options."
            )
        lines = [f"Here are {len(matches)} team picks that fit best:"]
        for m in matches:
            listing = m.listing
            price = f"${listing.price:,}" if listing.price else "price on request"
            reason = m.reasons[0] if m.reasons else "Curated by our team"
            line = f"• {listing.address} — {price}, {listing.open_house_time}. {reason}."
            note = listing.area_note or area_knowledge.notes_for(listing.area)
            if note:
                line += f" ({note})"
            lines.append(line)
        return "\n".join(lines)

    # -- public API --------------------------------------------------------
    def recommend(self, query: str, matches: List[ListingMatch], filters: ParsedFilters) -> str:
        if not self.available:
            return self._template(query, matches)
        try:
            listings_text = "\n".join(
                f"- {m.listing.address} | {m.listing.area} | "
                f"${m.listing.price or 0:,} | {m.listing.open_house_time} | "
                f"why: {'; '.join(m.listing.why_picks) or m.listing.notes}"
                for m in matches
            )
            area_notes = area_knowledge.notes_for_listings([m.listing for m in matches])
            notes_text = "\n".join(f"- {area}: {note}" for area, note in area_notes.items())

            response = self._get_client().messages.create(
                model=self.settings.anthropic_model,
                max_tokens=400,
                system=SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            f"Buyer question: {query}\n\n"
                            f"Matching team listings (the ONLY homes you may mention):\n"
                            f"{listings_text or 'None'}\n\n"
                            f"Neighborhood notes (factual context you may use):\n"
                            f"{notes_text or 'None'}"
                        ),
                    }
                ],
            )
            if response.stop_reason == "refusal":
                return REFUSAL_REPLY
            text = "".join(
                block.text for block in response.content if block.type == "text"
            ).strip()
            return text or self._template(query, matches)
        except Exception as exc:  # never fail the request because the LLM call failed
            logger.error("Claude call failed: %s", exc)
            return self._template(query, matches)
