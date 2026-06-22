"""Lead capture models."""

from typing import Optional

from pydantic import BaseModel, EmailStr


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str = ""
    source: Optional[str] = "contact"
    listing_id: Optional[int] = None
    listing_address: Optional[str] = None
    # Optional structured fields from the multi-step contact form
    intent: Optional[str] = None
    budget_range: Optional[str] = None
    areas: Optional[str] = None
    # Preferred tour scheduling (from the Schedule a Tour form)
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None


class LeadResponse(BaseModel):
    success: bool
    message: str
