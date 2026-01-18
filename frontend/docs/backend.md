Next, let’s implement Step 4 (FastAPI backend) to read/write Google Sheets.
Requirements:

GET /open-houses reads tab "open_house_picks" and returns JSON list

POST /leads appends a row to tab "leads" with created_at timestamp

Use env vars GOOGLE_SERVICE_ACCOUNT_JSON (stringified JSON) and GOOGLE_SHEET_ID

Add CORS for http://localhost:3000

Provide: main.py, services/sheets.py, requirements.txt, .env.example, and local run instructions.



Use GOOGLE_SERVICE_ACCOUNT_JSON from env.
Do NOT hardcode credentials.
Assume credentials are provided via environment variables.
