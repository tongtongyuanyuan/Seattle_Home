from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from services.sheets import SheetsService

# Initialize FastAPI app
app = FastAPI(title="Seattle Home Picks API")

# CORS configuration - allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",  # For Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google Sheets service
sheets_service = SheetsService()

# Pydantic models for request/response validation
class OpenHouse(BaseModel):
    id: int
    address: str
    area: str
    open_house_time: str
    redfin_url: str
    notes: str
    price: Optional[int] = None

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str
    source: Optional[str] = "contact"
    listing_id: Optional[int] = None
    listing_address: Optional[str] = None

class LeadResponse(BaseModel):
    success: bool
    message: str

# Health check endpoint
@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "Seattle Home Picks API",
        "version": "1.0.0"
    }

# GET /open-houses - Fetch open houses with optional filters
@app.get("/open-houses", response_model=List[OpenHouse])
async def get_open_houses(
    area: Optional[str] = None,
    day: Optional[str] = None
):
    """
    Fetch open houses from Google Sheets with optional filters.

    Query Parameters:
    - area: Filter by area (e.g., "Eastside", "North Seattle")
    - day: Filter by day (e.g., "Saturday", "Sunday")
    """
    try:
        open_houses = sheets_service.get_open_houses()

        # Apply filters if provided
        if area and area != "All":
            open_houses = [h for h in open_houses if h.get("area") == area]

        if day and day != "All":
            open_houses = [
                h for h in open_houses
                if day.lower() in h.get("open_house_time", "").lower()
            ]

        return open_houses
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch open houses: {str(e)}"
        )

# POST /leads - Submit a lead to Google Sheets
@app.post("/leads", response_model=LeadResponse)
async def create_lead(lead: LeadCreate):
    """
    Submit a lead to Google Sheets.

    Request Body:
    - name: Customer name (required)
    - email: Customer email (required)
    - phone: Customer phone (required)
    - message: Customer message
    - source: Source of lead ("open_house" or "contact")
    - listing_id: ID of the listing (optional)
    - listing_address: Address of the listing (optional)
    """
    try:
        # Add created_at timestamp
        lead_data = lead.dict()
        lead_data["created_at"] = datetime.now().isoformat()

        # Write to Google Sheets
        sheets_service.create_lead(lead_data)

        # TODO: Optional - Send email notification to agents
        # await send_email_notification(lead_data)

        return LeadResponse(
            success=True,
            message="Thank you! We will contact you soon."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit lead: {str(e)}"
        )

# Error handler for 404
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "success": False,
        "message": "Endpoint not found"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
