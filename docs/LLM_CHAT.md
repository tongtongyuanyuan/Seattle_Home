# LLM & Semantic Search — Guided Home Chat

> **Status: implemented (scaffold).** Embedding-based semantic search and LLM
> answer generation live in `backend/app/services/embedding_service.py` and
> `llm_service.py`. They are **off by default** and fall back to deterministic
> rule-based search, so the app runs free with no keys. Set `OPENAI_API_KEY`
> (+ `poetry install --with ai`) to turn them on.

## Product principle: guided chat, NOT a chatbot
- Answer real buyer questions, grounded **only** in our Google-Sheet picks.
- Parse intent: budget, area, day, preferences (schools / commute / value / views).
- Return 2–3 matching homes, each with a short "why".
- Never invent listings; never chat about unrelated topics.
- *"Redfin gives the data — we tell you how to judge."*

## How it works today (`POST /ask`)
1. `listing_search_service.parse_query` extracts budget / areas / day / preferences
   (rule-based, free).
2. Candidates are filtered from the sheet (Active rows only).
3. If `OPENAI_API_KEY` is set: `embedding_service` reranks candidates by semantic
   similarity, and `llm_service` writes a warm, grounded summary. Otherwise a
   deterministic template answer is returned.

## Enabling the AI path
- `backend/.env`: `OPENAI_API_KEY=sk-...` (optionally `OPENAI_MODEL`, `EMBEDDING_MODEL`)
- `poetry install --with ai`
- Restart `poetry run uvicorn app.main:app --reload` — health then shows `"ai_enabled": true`.

## Model / cost options
| Model | ~cost per query | Notes |
|-------|-----------------|-------|
| GPT-4o-mini (default) | ~$0.0002 | Cheap, solid quality |
| Claude Haiku 4.5 | ~$0.0003 | Drop-in swap in `llm_service` if preferred |
| text-embedding-3-small | ~$0.00001 | Embeddings for the semantic rerank |

~1,000 queries/month ≈ well under $1.

## Example
User: *"I want a home around $900k, within ~1 hour of downtown Seattle, safe area"*
- Rule-based alone catches `max_budget` + `seattle`.
- With the LLM it also infers `areas: [Seattle, Bellevue, Kirkland]`,
  `preferences: [commute, safe]` — then ranks the team's matching picks.

## Future (conversational)
- Multi-turn memory + clarifying follow-up questions.
- Neighborhood knowledge (commute / transit) grounded in an `areas` table.
- Reference: https://curated-by-cynthia.vercel.app/ (conversational, grounded in curated data).
