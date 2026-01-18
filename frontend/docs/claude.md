# Claude Instructions – Seattle Home Picks MVP

## Project Overview
This repository is for an MVP called **Seattle Home Picks** — a small, production-ready real estate website used by a real estate team.

Primary goals:
1. Home page with agent/team introduction
2. “This Weekend Open House Picks” page
3. “Schedule a Tour” lead capture form

This is an MVP. Keep everything simple, stable, and practical.

---

## Tech Stack
Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

Backend (later steps):
- FastAPI
- Google Sheets as the data source

Deployment:
- Frontend: Vercel
- Backend: Render

---

## Data Source
Google Sheets with two tabs:
1. `open_house_picks`
2. `leads`

Do NOT invent fields or data structures beyond what is specified in the implementation steps.

---

## Development Rules (Important)
- Follow the steps in order. Do NOT skip ahead.
- Do NOT add extra features unless explicitly requested.
- Prefer clarity and simplicity over abstraction.
- Keep components small and reusable.
- If something is missing, create the minimal version.
- If unsure, explain first before editing.

---

## Implementation Steps

### Step 1 – Frontend Skeleton
- Confirm Next.js App Router setup (TypeScript + Tailwind)
- Create pages:
  - `/` (Home)
  - `/open-houses`
  - `/contact`
- Create components:
  - `Navbar`
  - `ProfileCards`
- Create `lib/api.ts` with placeholders:
  - `fetchOpenHouses`
  - `submitLead`

### Step 2 – Open Houses Page
- Fetch data from backend API
- Support basic filters (area, day)
- Render open house cards
- Add “View on Redfin” and “Schedule a Tour”

### Step 3 – Schedule a Tour Modal
- Lead form with name/email/phone/message
- Submit to backend
- Show success state

Now proceed with Step 3 (Frontend – Schedule a Tour).

Important constraints:
- Do NOT connect to Google Sheets yet.
- Do NOT implement any real backend logic.
- Assume the backend APIs already exist.

Goals:
- Implement the Schedule a Tour modal and form.
- On submit, call submitLead() from lib/api.ts.
- For now, submitLead() can return a mocked success response.
- Focus only on UI behavior, validation, and user experience.

Stop after Step 3 and wait for my confirmation before moving to backend work.


### Step 4 – Backend (FastAPI)
- Implement:
  - `GET /open-houses`
  - `POST /leads`
- Read/write Google Sheets

Proceed to Step 4: Backend (FastAPI).

Now implement the real backend:
- Create FastAPI app with GET /open-houses and POST /leads
- Read data from Google Sheet "open_house_picks"
- Write submissions to Google Sheet "leads"

Assumptions:
- I already have a Google Sheet with correct columns.
- I will provide GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON via env vars.

and this is my url of google sheet: https://docs.google.com/spreadsheets/d/1KAnV5cF1Bc_xPOyW3g3zFHN_dkP-nAOofx3Fhdwq9Kk/edit?gid=0#gid=0
Requirements:
- Use Google Sheets API
- No database (no MySQL, no Postgres)
- Clean, minimal implementation suitable for MVP


### Step 5 – Admin Workflow
- Document how to update Google Sheets weekly

### Step 6 – Deployment
- Vercel (frontend)
- Render (backend)

---

## Execution Instruction
Treat this document as the **source of truth**.
Wait for explicit instruction before moving to the next step.
