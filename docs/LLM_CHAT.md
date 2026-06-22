# LLM Chat — Grounded Home Q&A (Anthropic Claude)

> **Status: implemented (scaffold).** `POST /ask` answers buyer questions grounded
> ONLY in the team's Google-Sheet listings plus a small neighborhood knowledge
> base. It runs free with no key (deterministic template); set `ANTHROPIC_API_KEY`
> (+ `poetry install --with ai`) to turn on Claude.

## Why no RAG / embeddings
With ~10–30 listings there is nothing to "retrieve at scale" — every listing fits
directly in the prompt. RAG and vector search solve a problem we don't have. The
useful addition for fuzzy questions ("is the commute good?", "how are the
schools?") is a small, factual **neighborhood knowledge base**, not a vector DB.
`backend/app/services/area_knowledge.py` holds it as a plain dict keyed by area.

## Product principle: guided chat, NOT a chatbot
- Answer real buyer questions, grounded only in our picks + area notes.
- Parse intent: budget, area, day, preferences (schools / commute / value / views).
- Return 2–3 matching homes, each with a short "why".
- Never invent listings; never chat about unrelated topics.

## Compliance guardrails (in the system prompt)
- No investment-return guarantees or future-value promises.
- No steering by protected class (Fair Housing); school/area notes stay factual.
- If matches are weak, say so and suggest broadening.

## How it works today (`POST /ask`)
1. `listing_search_service.parse_query` extracts budget / areas / day / preferences
   (rule-based, free).
2. Active listings are filtered from the sheet.
3. If `ANTHROPIC_API_KEY` is set: `llm_service` asks Claude for a warm, grounded
   answer using the matched homes + `area_knowledge` notes. Otherwise a
   deterministic template (which still appends the neighborhood note) is returned.

## Enabling Claude
- `backend/.env`: `ANTHROPIC_API_KEY=sk-ant-...` (optionally `ANTHROPIC_MODEL`)
- `poetry install --with ai`
- Restart `poetry run uvicorn app.main:app --reload` — health shows `"ai_enabled": true`.

## Model / cost
| Model | Default? | ~cost (in / out per MTok) |
|-------|----------|----------------------------|
| `claude-haiku-4-5` | ✅ default | $1 / $5 |
| `claude-opus-4-8` | set `ANTHROPIC_MODEL` | $5 / $25 |

Answers are capped at ~400 output tokens, so each question costs a fraction of a
cent on Haiku; set `ANTHROPIC_MODEL=claude-opus-4-8` for maximum quality.

## Future (conversational)
- Multi-turn memory + clarifying follow-up questions.
- Expand `area_knowledge` as the team adds neighborhoods.
- Reference: https://curated-by-cynthia.vercel.app/ (conversational, grounded in curated data).
