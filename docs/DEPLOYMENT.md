# Deployment Plan — Seattle Home Advisor (low-cost)

Goal: cheap, low-maintenance hosting for an agent showing homes to a modest
number of clients. The chosen stack **scales to zero** when idle, so it costs
roughly **$0/month** until there's real traffic.

## Recommended stack
| Piece | Host | Why | Cost at low traffic |
|-------|------|-----|---------------------|
| Frontend (Next.js) | **Vercel** | 1-click Next.js, free Hobby tier, auto HTTPS + CDN | $0 |
| Backend (FastAPI) | **GCP Cloud Run** | Serverless container in the *same* GCP project as the Sheet; run as the service account (no key file); scales to zero | ~$0 (free tier: 2M req/mo) |
| Data | Google Sheet | already in use | $0 |
| Chat (optional) | Anthropic Claude (Haiku) | pay-per-use, off unless `ANTHROPIC_API_KEY` is set | fractions of a cent / question |

> **Not chosen:** EC2 (you'd manage the VM, nginx, SSL, patching) and EKS
> (Kubernetes — ~$73/mo control plane alone, overkill for one small service).

### Why Cloud Run is the best fit
- Your Sheet + service account already live in GCP project `seattle-homes-pickes`.
- Cloud Run can **run as that service account**, so production uses Application
  Default Credentials — **no JSON key to ship or leak**.
- Scales to zero: you pay essentially nothing when nobody is browsing.

---

## Part A — Backend → GCP Cloud Run
Prereqs: `gcloud` CLI, the GCP project, billing enabled.

1. Add a `Dockerfile` to `backend/` (ask Claude to scaffold it):
   `python:3.12-slim` → install Poetry → `poetry install --without dev` →
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
2. Small code follow-up: in `google_sheet_service`, fall back to Application
   Default Credentials when no key file/JSON is set (so prod needs no key).
3. Deploy straight from the repo:
   ```bash
   cd backend
   gcloud run deploy seattle-home-advisor-api \
     --source . \
     --region us-west1 \
     --service-account seattle-home-sheet@seattle-homes-pickes.iam.gserviceaccount.com \
     --allow-unauthenticated \
     --set-env-vars GOOGLE_SHEET_ID=1KAnV5cF1Bc_xPOyW3g3zFHN_dkP-nAOofx3Fhdwq9Kk,OPEN_HOUSE_TAB=open_house_picks,LEADS_TAB=leads
   ```
4. Optional secrets (only if used) — `ANTHROPIC_API_KEY`, `SMTP_*` — store in
   Secret Manager and pass with `--set-secrets`.
5. Note the HTTPS URL Cloud Run returns (e.g. `https://...run.app`).

## Part B — Frontend → Vercel
1. Import the GitHub repo; set **Root Directory = `apps/web`**.
2. Env var: `NEXT_PUBLIC_API_BASE_URL=<Cloud Run URL, or api.yourdomain>`.
3. Deploy (auto-deploys on every push to `main`).

## Part C — CORS
Allow the Vercel domain (and custom domain) on the backend — via env or
`cors_origins` in `app/config.py` — then redeploy Cloud Run.

## Part D — Custom domain (you have one)
- **Frontend:** Vercel → Project → Domains → add `homes.<yourdomain>` → set the
  CNAME Vercel shows. HTTPS is automatic.
- **Backend:** Cloud Run → Manage Custom Domains → map `api.<yourdomain>` → add
  the DNS record (managed cert). Then point the frontend's
  `NEXT_PUBLIC_API_BASE_URL` to `https://api.<yourdomain>`.

## Cost summary (low traffic)
- Vercel Hobby: **$0**
- Cloud Run: **$0** within free tier (2M req/mo, scales to zero)
- Google Sheets API: **$0**
- Anthropic (only if enabled): ~$0.0002–0.003 per `/ask`
≈ **$0/month** until real traffic, then pennies.

## Checklist
- [ ] Backend `Dockerfile` + `gcloud run deploy`
- [ ] Cloud Run runs as the Sheets service account (ADC, no key file)
- [ ] Frontend on Vercel, root `apps/web`, `NEXT_PUBLIC_API_BASE_URL` set
- [ ] CORS allows the frontend / custom domain
- [ ] Custom domain mapped (frontend + `api.`), HTTPS green
- [ ] `/open-houses` returns real homes; lead submit writes to the sheet
