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

### Step 4 – Backend (FastAPI)
- Implement:
  - `GET /open-houses`
  - `POST /leads`
- Read/write Google Sheets

### Step 5 – Admin Workflow
- Document how to update Google Sheets weekly

### Step 6 – Deployment
- Vercel (frontend)
- Render (backend)

---

## Execution Instruction
Treat this document as the **source of truth**.
Wait for explicit instruction before moving to the next step.
