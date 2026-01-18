# Seattle Home Picks - Backend API

FastAPI backend for managing open house listings and lead submissions with Google Sheets integration.

## Features

- ✅ **GET /open-houses** - Fetch open houses with optional filters (area, day)
- ✅ **POST /leads** - Submit lead forms to Google Sheets
- ✅ Google Sheets integration for data storage
- ✅ CORS enabled for frontend access
- ✅ Input validation with Pydantic
- ✅ Ready for deployment on Render

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Google Sheets API** - Data storage
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

## Setup Instructions

### 1. Prerequisites

- Python 3.9 or higher
- Google Cloud account
- Google Sheets document

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in service account details
   - Click "Create and Continue"
   - Skip granting roles (optional)
   - Click "Done"

5. Create Service Account Key:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Download the JSON file (keep it secure!)

### 3. Google Sheets Setup

1. Create a Google Sheet named "Seattle Home Picks"
2. Create two sheets (tabs):

#### Sheet 1: `open_house_picks`
Headers (Row 1):
```
id | address | area | open_house_time | redfin_url | notes | price
```

Example data:
```
1 | 123 Main St, Bellevue, WA 98004 | Eastside | Sat 1-4 PM | https://redfin.com/... | Great schools | 950000
```

#### Sheet 2: `leads`
Headers (Row 1):
```
created_at | name | email | phone | message | source | listing_id | listing_address
```

3. Share the sheet with service account:
   - Click "Share" button
   - Paste the service account email (from JSON file: `client_email`)
   - Give "Editor" permission
   - Click "Send"

### 4. Local Development Setup

1. Clone/navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Edit `.env` file:
- Open the downloaded JSON key file
- Copy the entire JSON content (it's one line)
- Paste it as the value for `GOOGLE_SERVICE_ACCOUNT_JSON` in `.env`
- Get your Google Sheet ID from the URL:
  - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
  - Copy the `SHEET_ID` part
- Paste it as `GOOGLE_SHEET_ID` in `.env`

Example `.env`:
```env
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...",...}'
GOOGLE_SHEET_ID=1abc123def456ghi789jkl
PORT=8000
```

6. Run the development server:
```bash
python main.py
```

or

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

### 5. Test the API

**Test health check:**
```bash
curl http://localhost:8000/
```

**Get open houses:**
```bash
curl http://localhost:8000/open-houses
```

**Filter open houses:**
```bash
curl "http://localhost:8000/open-houses?area=Eastside&day=Saturday"
```

**Submit a lead:**
```bash
curl -X POST http://localhost:8000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(206) 555-0100",
    "message": "Interested in viewing properties",
    "source": "contact"
  }'
```

### 6. API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── main.py                 # FastAPI application and endpoints
├── services/
│   ├── __init__.py
│   └── sheets.py          # Google Sheets integration
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create from .env.example)
├── .env.example           # Example environment variables
└── README.md              # This file
```

## API Endpoints

### GET /open-houses

Fetch open houses with optional filters.

**Query Parameters:**
- `area` (optional): Filter by area (e.g., "Eastside", "North Seattle")
- `day` (optional): Filter by day (e.g., "Saturday", "Sunday")

**Response:**
```json
[
  {
    "id": 1,
    "address": "123 Main St, Bellevue, WA 98004",
    "area": "Eastside",
    "open_house_time": "Sat 1-4 PM",
    "redfin_url": "https://redfin.com/...",
    "notes": "Great schools, close to tech companies",
    "price": 950000
  }
]
```

### POST /leads

Submit a lead form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(206) 555-0100",
  "message": "I want to tour: 123 Main St",
  "source": "open_house",
  "listing_id": 1,
  "listing_address": "123 Main St, Bellevue, WA 98004"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you! We will contact you soon."
}
```

## Deployment on Render

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" > "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: seattle-home-picks-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - `GOOGLE_SHEET_ID`
7. Click "Create Web Service"
8. Update frontend `.env` with the Render URL:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-app.onrender.com
   ```

## Troubleshooting

**Error: "GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set"**
- Make sure `.env` file exists and contains the service account JSON

**Error: "Permission denied"**
- Verify the Google Sheet is shared with the service account email
- Check that the service account has "Editor" permission

**Error: "Sheet not found"**
- Verify sheet names are exactly `open_house_picks` and `leads`
- Check column headers match the expected format

## Next Steps

- [ ] Add email notifications when leads are submitted
- [ ] Implement caching for open houses
- [ ] Add authentication for admin endpoints
- [ ] Create admin dashboard for managing listings

## Support

For issues or questions, please check:
- FastAPI documentation: https://fastapi.tiangolo.com/
- Google Sheets API docs: https://developers.google.com/sheets/api
