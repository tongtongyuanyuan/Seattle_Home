Below is a **clean, professional English version** of your entire document.
I’ve translated it faithfully, keeping the **tone practical, product-oriented, and non-AI-sounding**, so you can use it directly for teammates, Claude prompts, or documentation.

---

Below is a **complete, production-ready design plan + step-by-step Claude implementation guide**, exactly as you requested: **the simplest, lowest-cost, and most reliable approach**.
If you follow it step by step, it’s very hard to go wrong.

---

# ✅ Final Goal (MVP)

Build a small, team-usable website that actually works:

1. **Home**: You + Team Lead intro + clear entry buttons
2. **This Weekend Open House Picks**: 10–30 curated homes, updated manually every Friday (via Google Sheets)
3. **Schedule a Tour**: Lead capture (saved to Google Sheets + email notification)
4. *(Optional, later)* Team Listings / Sold / Chat-based recommendations

> Once you complete 1–3, the site is already usable and can start generating leads.

---

# 🧱 Tech Stack (Simple & Cost-Effective)

* **Frontend**: Next.js (React) + Tailwind
  Deployment: Vercel (free tier)
* **Backend**: FastAPI
  Deployment: Render (recommended for MVP), or Vercel serverless if you prefer
* **Data**: Google Sheets (10–30 listings updated weekly)
* **Forms**: Custom `/api/leads` endpoint writing directly to Google Sheets (no third-party form tools)

> Why Render for backend: FastAPI runs persistently and is easier to manage.
> Vercel + Python works too, but beginners often get stuck on deployment details.
> If you want to go ultra-minimal, everything can live on Vercel—we can switch later.

---

# 🧾 Data Design (Google Sheets Template)

Create a Google Sheet named: **`Seattle Home Picks`**

## Sheet 1: `open_house_picks`

You only need to manually maintain these columns (copy & paste workflow):

* `id` (1, 2, 3…)
* `address`
* `area` (Eastside / North Seattle / South / etc.)
* `open_house_time` (e.g. `Sat 1–4 PM`, `Sun 12–3 PM`)
* `redfin_url`
* `notes` (one short line: `Great schools / good value / layout`)
* *(Optional)* `price` (helps with filtering if you want)

## Sheet 2: `leads`

* `created_at`
* `name`
* `email`
* `phone`
* `message`
* `source` (open_house / home)
* `listing_id` (optional)
* `listing_address` (optional)

> MVP does NOT need school ratings, images, beds/baths, etc.
> You can add those later without changing the architecture.

---

# 🖼️ UI / UX Design (MVP Version)

## 1) Home (`/`)

* Top: Site name + menu (Open Houses / Contact)
* Two profile cards:

  * **Team Lead**: Name, title, short credibility line
  * **You**: “10-year Seattle resident” + honest, practical positioning
* Three buttons:

  * **This Weekend Open Houses**
  * **Schedule a Tour**
  * *(Greyed out / Coming soon)* Team Listings / Sold

---

## 2) Open Houses (`/open-houses`)

### Filters (keep it extremely simple)

* Area: All / Eastside / North Seattle / …
* Day: All / Sat / Sun
  (simple string match from `open_house_time`)

### Listing cards

* Address
* Open house time
* Notes (your commentary)
* Buttons:

  * **View on Redfin** (open `redfin_url` in new tab)
  * **Schedule a Tour** (opens modal)

---

## 3) Schedule a Tour (Shared Modal)

Fields:

* Name
* Email
* Phone
* Message (prefilled: `I want to tour: [address]`)

After submit:

* Success message: *“We’ll reach out soon.”*

---

# 🔌 API Design (FastAPI)

Only two endpoints are needed:

### 1) `GET /open-houses`

* Query params: `area` (optional), `day` (optional)
* Response:

```json
[
  {
    "id": 1,
    "address": "...",
    "area": "...",
    "open_house_time": "...",
    "redfin_url": "...",
    "notes": "...",
    "price": 950000
  }
]
```

### 2) `POST /leads`

* Body:

```json
{
  "name": "...",
  "email": "...",
  "phone": "...",
  "message": "...",
  "source": "open_house",
  "listing_id": 1,
  "listing_address": "..."
}
```

* Action:

  * Append to `leads` sheet
  * *(Optional)* Send email notification to you + Team Lead

---

# 🗂️ Project Structure (Recommended)

You can use one repo or split frontend/backend.

## Frontend (Next.js)

```text
frontend/
  app/
    page.tsx
    open-houses/page.tsx
    contact/page.tsx
  components/
    Navbar.tsx
    ProfileCards.tsx
    OpenHouseCard.tsx
    TourModal.tsx
    Filters.tsx
  lib/
    api.ts
  styles/
```

## Backend (FastAPI)

```text
backend/
  main.py
  services/
    sheets.py
    email.py   # optional
  requirements.txt
  .env
```

---

# 💰 Deployment (Low-Cost Setup)

### Frontend: Vercel (Free)

* Connect GitHub repo
* Automatic deploys

### Backend: Render

* Single FastAPI web service
* Environment variables in Render dashboard
* Free tier may sleep; $7/month for always-on stability

---

# ✅ Claude Step-by-Step Implementation Guide

You can copy each prompt directly into Claude.

---

## Step 0: Generate Overall Task Plan

```text
You are my senior full-stack engineer.
We are building an MVP “Seattle Home Picks” website.

Tech:
- Frontend: Next.js (App Router) + Tailwind
- Backend: FastAPI
- Data: Google Sheets (open_house_picks and leads)
- Deploy: Vercel (frontend) + Render (backend)

MVP Pages:
1) Home page with Team Lead + me profile cards and buttons.
2) Open Houses page: list curated open houses from backend, with filters (area + day).
3) Schedule a Tour modal: submit lead form to backend; backend writes to Google Sheets.

Please produce:
- A step-by-step build plan
- Data schema for the Google Sheet
- API contract between frontend and backend
Keep it concise and implementation-ready.
```

---

## Step 1: Generate Frontend Project Skeleton

```text
Generate a Next.js 14+ App Router project structure for the MVP.
Use TypeScript and Tailwind.

Pages:
- / (Home)
- /open-houses
- /contact

Components:
- Navbar
- ProfileCards (Team Lead + Me)
- OpenHouseCard
- Filters (Area + Day)
- TourModal (lead form)

Also generate:
- lib/api.ts with functions:
  - fetchOpenHouses(params)
  - submitLead(payload)

Include minimal styling (clean, modern).
Return code for each file with paths.
```

---

## Step 2: Implement Open Houses Page

```text
Implement /open-houses page using React server components where possible.
- Fetch open houses from process.env.NEXT_PUBLIC_API_BASE_URL + "/open-houses"
- Support query params: area, day
- Render list of OpenHouseCard
- Filters update the URL query string and refetch
- Each card shows:
  - Address, open house time, notes
  - Button: View on Redfin (new tab)
  - Button: Schedule a Tour (prefilled modal)

Return code updates with file paths only.
```

---

## Step 3: Implement Tour Modal + Lead Submission

```text
Implement TourModal:
Fields: name, email, phone, message
Prefill message with "I want to tour: {address}"
On submit:
- POST to API_BASE_URL + "/leads"
- Include source="open_house", listing_id, listing_address
Show loading and success states.
Add basic validation (name/email/phone required).
Return code with file paths.
```

---

## Step 4: Build FastAPI Backend (Google Sheets)

```text
Create a FastAPI backend with:

GET /open-houses
- Read Google Sheet tab "open_house_picks"
- Return fields: id, address, area, open_house_time, redfin_url, notes, price (optional)

POST /leads
- Accept JSON: name, email, phone, message, source, listing_id(optional), listing_address(optional)
- Append row to "leads" tab with created_at timestamp

Use:
- GOOGLE_SERVICE_ACCOUNT_JSON (env, stringified JSON)
- GOOGLE_SHEET_ID (env)
Enable CORS for frontend.

Provide:
- main.py
- services/sheets.py
- requirements.txt
- Local run instructions
```

---

## Step 5: Admin Update Guide

```text
Write a short markdown admin guide:
- Which columns to update
- Example rows
- Weekly workflow
Add note: do not copy Redfin data fields; only store address, link, notes, open house time.
```

---

## Step 6: Deployment Guide

```text
Write a deployment guide:
- Deploy frontend to Vercel
- Deploy backend to Render
- Required environment variables
- End-to-end testing checklist
Keep it short and practical.
```

---

# ✅ You Can Start with Just These 3 Things

1. Create the Google Sheet (2 tabs + columns above)
2. Create a Google Service Account and share the Sheet with it
3. Pick a repo name (e.g. `seattle-home-picks`) and start with Step 1

---

If you want, I can next:

* Turn all your mentioned neighborhoods into a structured `areas` table (with commute + transit notes)
* Add a “Commute & Transit” UI module
* Update Claude prompts to include commute/transit logic

Just tell me which one you want next.
