"""LLM recommendation response.

Produces the natural-language answer shown to the user for a `/ask` query,
grounded ONLY in the team's listings that the search service surfaced.

* With an OpenAI key + the ``openai`` package: a concise, friendly summary that
  cites the actual matched homes (the model is given the matches as context and
  instructed not to invent listings).
* Without them: a clean deterministic template built from the same matches.

Either way the answer references only real listings — there is no open-ended
chatbot behaviour.
"""

from typing import List

from app.config import Settings
from app.models.search import ListingMatch, ParsedFilters

try:  # openai is an optional dependency (poetry group "ai")
    from openai import OpenAI
except ImportError:  # pragma: no cover - depends on install profile
    OpenAI = None  # type: ignore[assignment]

SYSTEM_PROMPT = (
    "You are a Seattle real estate assistant for a small agent team. "
    "You may ONLY discuss the specific listings provided to you as context. "
    "Never invent homes, prices, or facts. If the matches are weak, say so and "
    "suggest broadening the search. Keep the answer to 2-4 short sentences, "
    "warm and concrete, and refer to homes by their address."
)


class LLMService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None

    @property
    def available(self) -> bool:
        return OpenAI is not None and bool(self.settings.openai_api_key)

    def _get_client(self):
        if self._client is None:
            self._client = OpenAI(api_key=self.settings.openai_api_key)
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
            lines.append(
                f"• {listing.address} — {price}, {listing.open_house_time}. {reason}."
            )
        return "\n".join(lines)

    # -- public API --------------------------------------------------------
    def recommend(self, query: str, matches: List[ListingMatch], filters: ParsedFilters) -> str:
        if not self.available:
            return self._template(query, matches)
        try:
            context = "\n".join(
                f"- {m.listing.address} | {m.listing.area} | "
                f"${m.listing.price or 0:,} | {m.listing.open_house_time} | "
                f"why: {'; '.join(m.listing.why_picks) or m.listing.notes}"
                for m in matches
            )
            resp = self._get_client().chat.completions.create(
                model=self.settings.openai_model,
                temperature=0.4,
                max_tokens=220,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": (
                            f"User question: {query}\n\n"
                            f"Matching team listings (the ONLY homes you may mention):\n"
                            f"{context or 'None'}"
                        ),
                    },
                ],
            )
            return resp.choices[0].message.content.strip()
        except Exception:
            # Never fail the request because the LLM call failed.
            return self._template(query, matches)
