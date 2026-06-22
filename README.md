# Seattle Home Advisor

A small, production-minded real estate site for a Seattle agent team. It shows
**curated team listings** (sourced from a Google Sheet) and helps buyers decide
*why* each pick is good — with explainable picks, a guided Q&A, and lead capture.

## Structure

```
seattle-home-picks/
├── apps/
│   └── web/            # Next.js (App Router) frontend — TypeScript + Tailwind
└── backend/            # FastAPI backend — Poetry, Google Sheets data source
    ├── pyproject.toml
    └── app/
        ├── main.py
        ├── api/routes.py
        ├── models/
        └── services/   # sheets, normalization, search, embeddings, maps, llm
```

## Prerequisites

- **Node.js** 18+ (frontend)
- **Python** 3.11+ and **Poetry** (backend) — install Poetry with `pip install poetry`
- A **Google Cloud service account** with the **Google Sheets API** enabled, and
  the spreadsheet shared with the service-account email as **Editor**

## Run locally

The app runs as two processes. Open two terminals from the repo root.

**Terminal 1 — backend (FastAPI + Poetry):**

```bash
cd backend
cp .env.example .env        # first time only — fill in GOOGLE_SHEET_ID + credentials
poetry install              # first time only — creates the virtualenv + lockfile
poetry run uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs

**Terminal 2 — frontend (Next.js):**

```bash
cd apps/web
npm install                 # first time only
npm run dev
```

- Site: http://localhost:3000
- The frontend reads the backend URL from `apps/web/.env.local`
  (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`).

> The backend boots with **zero API keys** — semantic search and the LLM answer
> fall back to deterministic, rule-based logic (`"ai_enabled": false` on the
> health check). It only needs Google Sheets credentials to serve real data.

## Configuration

**Backend** (`backend/.env`, see `.env.example`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `GOOGLE_SHEET_ID` | ✅ | Spreadsheet ID from its URL |
| `GOOGLE_SERVICE_ACCOUNT_FILE` *or* `GOOGLE_SERVICE_ACCOUNT_JSON` | ✅ | Service-account credentials (file path locally, JSON string in prod) |
| `OPEN_HOUSE_TAB` / `LEADS_TAB` | – | Sheet tab names (default `open_house_picks` / `leads`) |
| `OPENAI_API_KEY` | optional | Enables semantic search + LLM answers. Also run `poetry install --with ai`. Leave unset to stay free. |

**GCP:** the only API you need enabled is the **Google Sheets API**. Map links are
generated keyless (no paid Maps/Street View APIs).

## Endpoints

- `GET /` — health check
- `GET /open-houses?area=&day=` — team listings (Inactive rows filtered out)
- `POST /leads` — append a lead to the sheet
- `POST /ask` — guided Q&A grounded only in team listings

## Deployment

- **Frontend → Vercel** (root directory `apps/web`)
- **Backend → Render** (see `backend/render.yaml`)
