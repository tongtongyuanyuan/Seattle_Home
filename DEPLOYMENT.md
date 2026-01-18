# Deployment Guide: Seattle Home Picks

## Overview
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (FastAPI)

---

## Part 1: Deploy Backend to Render

### Step 1: Push Code to GitHub
Make sure your code is in a GitHub repository.

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 3: Create Web Service
1. Click **New** → **Web Service**
2. Connect your GitHub repo
3. Select the `backend` directory as root
4. Configure:
   - **Name**: `seattle-home-picks-api`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 4: Set Environment Variables
In Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `GOOGLE_SHEET_ID` | `1KAnV5cF1Bc_xPOyW3g3zFHN_dkP-nAOofx3Fhdwq9Kk` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | (paste entire JSON as single line) |
| `OPEN_HOUSE_TAB` | `open_house_picks` |
| `LEADS_TAB` | `leads` |

**To convert JSON to single line:**
```bash
cat secrets/gcp-service-account.json | jq -c .
```

### Step 5: Deploy
Click **Create Web Service**. Render will build and deploy.

Your backend URL will be: `https://seattle-home-picks-api.onrender.com`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### Step 2: Import Project
1. Click **Add New** → **Project**
2. Import your GitHub repo
3. Select the `frontend` directory as root

### Step 3: Configure Build Settings
Vercel auto-detects Next.js. Default settings work.

### Step 4: Set Environment Variables
Add this environment variable:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://seattle-home-picks-api.onrender.com` |

(Use your actual Render URL from Part 1)

### Step 5: Deploy
Click **Deploy**. Vercel will build and deploy.

Your frontend URL will be: `https://seattle-home-picks.vercel.app` (or similar)

---

## Part 3: Update CORS (Backend)

After deploying, update `backend/main.py` to allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://seattle-home-picks.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app",
    ],
    ...
)
```

Redeploy the backend after this change.

---

## Verification Checklist

- [ ] Backend health check: `https://your-backend.onrender.com/`
- [ ] Backend API: `https://your-backend.onrender.com/open-houses`
- [ ] Frontend loads: `https://your-frontend.vercel.app`
- [ ] Open houses display correctly
- [ ] Lead form submits successfully
- [ ] Check Google Sheet `leads` tab for new entry

---

## Troubleshooting

### Backend returns 500 error
- Check Render logs for error details
- Verify `GOOGLE_SERVICE_ACCOUNT_JSON` is properly formatted (single line, no extra quotes)
- Make sure Google Sheets API is enabled

### Frontend shows no data
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Test backend API directly in browser

### CORS errors
- Add your Vercel domain to `allow_origins` in `main.py`
- Redeploy backend

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed
