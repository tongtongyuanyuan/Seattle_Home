# Seattle Home Picks - Quick Start Guide

Complete setup guide for both frontend and backend.

## Overview

This project consists of:
- **Frontend**: Next.js app (in `/frontend`)
- **Backend**: FastAPI server (in `/backend`)
- **Data**: Google Sheets

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- Google Cloud account
- Google Sheets document

---

## Setup Steps

### Step 1: Google Cloud & Sheets Setup

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create new project or select existing

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search "Google Sheets API" and enable it

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name it (e.g., "seattle-home-picks")
   - Click "Create and Continue"
   - Skip optional steps, click "Done"

4. **Download Service Account Key**
   - Click on the service account you created
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download and keep secure!

5. **Create Google Sheet**
   - Create a sheet named "Seattle Home Picks"
   - Add two tabs: `open_house_picks` and `leads`

   **Tab 1: open_house_picks**
   ```
   Headers (row 1):
   id | address | area | open_house_time | redfin_url | notes | price
   ```

   **Tab 2: leads**
   ```
   Headers (row 1):
   created_at | name | email | phone | message | source | listing_id | listing_address
   ```

6. **Share Sheet with Service Account**
   - Click "Share" on your Google Sheet
   - Paste the `client_email` from your downloaded JSON file
   - Give "Editor" permission
   - Click "Send"

### Step 2: Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Edit `.env` file:**
1. Open your downloaded JSON key file
2. Copy the entire JSON content
3. Paste as `GOOGLE_SERVICE_ACCOUNT_JSON` value in `.env`
4. Get your Sheet ID from the URL:
   - URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Copy `YOUR_SHEET_ID`
5. Add as `GOOGLE_SHEET_ID` in `.env`

**Start backend:**
```bash
python main.py
# Server runs at http://localhost:8000
```

**Test backend:**
```bash
curl http://localhost:8000/
curl http://localhost:8000/open-houses
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend folder (in new terminal)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
```

**Edit `.env.local`:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Start frontend:**
```bash
npm run dev
# Runs at http://localhost:3000
```

### Step 4: Test the Complete App

1. **Visit** http://localhost:3000
2. **Navigate to Open Houses** page
3. **Try filters** (Area, Day)
4. **Click "Schedule a Tour"** on a property
5. **Fill and submit** the form
6. **Check your Google Sheet** - new row should appear in `leads` tab!

---

## Adding Open Houses

To add open houses to your site:

1. Open your Google Sheet
2. Go to `open_house_picks` tab
3. Add a new row with:
   - `id`: Unique number (1, 2, 3...)
   - `address`: Full address
   - `area`: Eastside / North Seattle / South Seattle / Downtown
   - `open_house_time`: e.g., "Sat 1-4 PM"
   - `redfin_url`: Link to Redfin listing
   - `notes`: Your commentary (1-2 sentences)
   - `price`: Number without $ or commas (e.g., 950000)

4. Refresh your website - new listing appears!

---

## Project Structure

```
seattle-home-picks/
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages (Home, Open Houses, Contact)
│   │   ├── components/    # React components
│   │   └── lib/           # API utilities
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # FastAPI backend
│   ├── services/          # Google Sheets integration
│   ├── main.py           # API endpoints
│   ├── requirements.txt
│   └── .env              # Environment variables
│
└── QUICKSTART.md         # This file
```

---

## Troubleshooting

**Backend won't start:**
- Check Python version: `python --version` (need 3.9+)
- Verify virtual environment is activated
- Check `.env` file has correct values

**Frontend can't connect to backend:**
- Ensure backend is running on port 8000
- Check `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- Restart frontend after changing `.env.local`

**Google Sheets errors:**
- Verify sheet is shared with service account email
- Check sheet names are exactly `open_house_picks` and `leads`
- Ensure column headers match exactly (case-sensitive)

**No data showing:**
- Add at least one row to `open_house_picks` sheet
- Refresh the page
- Check browser console for errors

---

## Next Steps

Once everything works locally:

1. **Deploy Backend** to Render (see backend/README.md)
2. **Deploy Frontend** to Vercel
3. **Update frontend** `.env` with production backend URL
4. **Update Google Sheets** weekly with new open houses

---

## Support

- Frontend docs: `frontend/README.md`
- Backend docs: `backend/README.md`
- FastAPI documentation: https://fastapi.tiangolo.com/
- Next.js documentation: https://nextjs.org/docs
