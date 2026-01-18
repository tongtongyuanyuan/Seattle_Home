# Google Cloud & Sheets Setup Guide

## What I've Done For You ✅

- ✅ Installed all backend Python dependencies
- ✅ Created frontend .env.local file
- ✅ Set up all code and configurations

## What You Need To Do Manually 👤

You need to complete these 3 steps (takes about 10 minutes total):

---

## Step 1: Google Cloud Setup (5 minutes)

### 1.1 Create/Select Project
1. Go to https://console.cloud.google.com/
2. Click the project dropdown at the top
3. Click "New Project" or select existing project
4. Name it: "seattle-home-picks"
5. Click "Create"

### 1.2 Enable Google Sheets API
1. In the search bar, type "Google Sheets API"
2. Click on "Google Sheets API"
3. Click the blue "Enable" button
4. Wait for it to enable (takes ~30 seconds)

### 1.3 Create Service Account
1. Go to "APIs & Services" → "Credentials" (left sidebar)
2. Click "Create Credentials" → "Service Account"
3. Fill in:
   - **Service account name**: `seattle-home-picks`
   - **Service account ID**: (auto-generated, leave it)
4. Click "Create and Continue"
5. Skip "Grant this service account access" (click Continue)
6. Skip "Grant users access" (click Done)

### 1.4 Download JSON Key
1. You'll see your service account in the list
2. Click on it (the email address)
3. Go to "Keys" tab at the top
4. Click "Add Key" → "Create new key"
5. Choose "JSON" format
6. Click "Create"
7. **A JSON file will download** - save it somewhere safe!

**📝 Note:** Keep this JSON file secure - it contains credentials!

---

## Step 2: Google Sheets Setup (2 minutes)

### 2.1 Create the Sheet
1. Go to https://sheets.google.com/
2. Click "+ Blank" to create new sheet
3. Rename it: "Seattle Home Picks"

### 2.2 Create First Tab: `open_house_picks`
1. Double-click the default "Sheet1" tab name
2. Rename to: `open_house_picks`
3. In row 1, add these headers (copy-paste):
   ```
   id	address	area	open_house_time	redfin_url	notes	price
   ```
4. Add a test row (row 2):
   ```
   1	123 Main St, Bellevue, WA 98004	Eastside	Sat 1-4 PM	https://www.redfin.com	Great schools	950000
   ```

### 2.3 Create Second Tab: `leads`
1. Click the "+" at bottom to add new sheet
2. Rename to: `leads`
3. In row 1, add these headers:
   ```
   created_at	name	email	phone	message	source	listing_id	listing_address
   ```

### 2.4 Share with Service Account
1. Click the green "Share" button (top right)
2. Open your downloaded JSON file
3. Find the line that says `"client_email"`
4. Copy the email address (looks like: `seattle-home-picks@...iam.gserviceaccount.com`)
5. Paste it in the "Add people" field
6. Change permission to "Editor"
7. **Uncheck** "Notify people" (it's a robot, doesn't need email!)
8. Click "Share"

### 2.5 Get Sheet ID
1. Look at your browser URL
2. It looks like: `https://docs.google.com/spreadsheets/d/LONG_ID_HERE/edit`
3. Copy the `LONG_ID_HERE` part
4. Save it somewhere - you'll need it next!

---

## Step 3: Configure Backend .env (1 minute)

### 3.1 Open the JSON Key File
1. Find the JSON file you downloaded
2. Open it in a text editor
3. **Copy the ENTIRE contents** (it's all one line of JSON)

### 3.2 Create .env File
1. Open: `/Users/tongxue/Desktop/AI/AI_Project/seattle-home-picks/backend/.env`
2. If file doesn't exist, create it
3. Add this content:

```env
# Paste your entire JSON here (keep it on one line, with quotes around it)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...PASTE_YOUR_ENTIRE_JSON_HERE..."}'

# Paste your Sheet ID here
GOOGLE_SHEET_ID=your_sheet_id_from_url_here

# Server port (leave as is)
PORT=8000
```

**Important:**
- The JSON must be wrapped in single quotes: `'{ ... }'`
- The JSON should be all on ONE line
- Replace `your_sheet_id_from_url_here` with your actual Sheet ID

---

## Step 4: Test Everything

### 4.1 Start the Backend
```bash
cd /Users/tongxue/Desktop/AI/AI_Project/seattle-home-picks/backend
source venv/bin/activate
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 4.2 Test in Browser
1. Open: http://localhost:8000
2. You should see: `{"status":"healthy",...}`
3. Open: http://localhost:8000/open-houses
4. You should see your test listing!

### 4.3 Enable Frontend Connection
1. Open: `/Users/tongxue/Desktop/AI/AI_Project/seattle-home-picks/frontend/.env.local`
2. Uncomment this line:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```
3. Restart your frontend server (Ctrl+C, then `npm run dev`)

### 4.4 Test the Full App
1. Visit: http://localhost:3000/open-houses
2. You should see your real Google Sheets data!
3. Submit a test form
4. Check your Google Sheet - new row should appear in `leads` tab!

---

## Troubleshooting

**"Permission denied" error:**
- Make sure you shared the Sheet with the service account email
- Check the email is correct from the JSON file

**"Sheet not found" error:**
- Verify tab names are exactly: `open_house_picks` and `leads` (lowercase, underscore)
- Check your Sheet ID is correct

**"Invalid JSON" error:**
- Make sure the entire JSON is on one line in .env
- Check it's wrapped in single quotes
- No line breaks in the JSON

**Still not working?**
- Let me know which step failed and I'll help debug!

---

## Next Steps After Setup

Once everything works:
1. Add more open houses to your Google Sheet
2. Update the sheet weekly with new listings
3. Deploy to production (Step 6 in CLAUDE.md)

---

## Summary Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google Sheets API
- [ ] Created service account
- [ ] Downloaded JSON key file
- [ ] Created Google Sheet with 2 tabs
- [ ] Added headers to both tabs
- [ ] Added test data to open_house_picks
- [ ] Shared sheet with service account email
- [ ] Copied Sheet ID
- [ ] Created backend .env file
- [ ] Pasted JSON and Sheet ID into .env
- [ ] Started backend successfully
- [ ] Enabled frontend .env.local
- [ ] Tested full app - it works!

**Once all checkboxes are done, everything will be working! 🎉**
