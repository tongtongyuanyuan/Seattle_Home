"""HTTP routes for the Seattle Home Advisor API.

Endpoints:
* ``GET  /open-houses`` — raw team listings (stable contract for the frontend).
* ``POST /leads``       — append a lead to the Google Sheet.
* ``POST /ask``         — guided Q&A grounded in team listings.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from app.config import Settings, get_settings
from app.models.lead import LeadCreate, LeadResponse
from app.models.listing import OpenHouse
from app.models.search import AskRequest, AskResponse
from app.services import listing_search_service, normalization_service
from app.services.email_service import EmailService
from app.services.embedding_service import EmbeddingService
from app.services.google_sheet_service import GoogleSheetService
from app.services.llm_service import LLMService

router = APIRouter()


# --- service singletons (cheap to construct; clients are lazy) ------------
def get_sheet_service(settings: Settings = Depends(get_settings)) -> GoogleSheetService:
    return GoogleSheetService(settings)


def get_embedding_service(settings: Settings = Depends(get_settings)) -> EmbeddingService:
    return EmbeddingService(settings)


def get_llm_service(settings: Settings = Depends(get_settings)) -> LLMService:
    return LLMService(settings)


def get_email_service(settings: Settings = Depends(get_settings)) -> EmailService:
    return EmailService(settings)


@router.get("/open-houses", response_model=List[OpenHouse])
def get_open_houses(
    area: Optional[str] = None,
    day: Optional[str] = None,
    sheets: GoogleSheetService = Depends(get_sheet_service),
):
    """Fetch open houses with optional ``area`` / ``day`` filters."""
    try:
        rows = sheets.get_open_houses()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch open houses: {exc}")

    # Drop Inactive rows (Team Listings Only guardrail).
    rows = [r for r in rows if (r.get("status") or "").strip().lower() in ("", "active")]

    if area and area != "All":
        a = area.lower()
        rows = [
            r
            for r in rows
            if a in (r.get("area") or "").lower()
            or a in (r.get("address") or "").lower()
        ]
    if day and day != "All":
        # "Saturday" should match an open_house_time of "Sat 1-4 PM"
        d = day[:3].lower()
        rows = [r for r in rows if d in (r.get("open_house_time") or "").lower()]
    return rows


@router.post("/leads", response_model=LeadResponse)
def create_lead(
    lead: LeadCreate,
    sheets: GoogleSheetService = Depends(get_sheet_service),
    email: EmailService = Depends(get_email_service),
):
    """Record a lead: save to the Google Sheet and email the agent team.

    Resilient by design — if the sheet write fails (e.g. credentials issue) but
    the email notification succeeds, the request still succeeds, so the agent is
    never left unaware of a tour request.
    """
    data = lead.model_dump()
    data["created_at"] = datetime.now().isoformat()

    sheet_ok = False
    sheet_error = None
    try:
        sheets.create_lead(data)
        sheet_ok = True
    except Exception as exc:
        sheet_error = str(exc)

    email_ok = email.send_lead_notification(data)

    if not sheet_ok and not email_ok:
        raise HTTPException(
            status_code=500,
            detail=f"Could not record your request. {sheet_error or ''}".strip(),
        )
    return LeadResponse(success=True, message="Thank you! We will contact you soon.")


@router.post("/ask", response_model=AskResponse)
def ask(
    request: AskRequest,
    sheets: GoogleSheetService = Depends(get_sheet_service),
    embeddings: EmbeddingService = Depends(get_embedding_service),
    llm: LLMService = Depends(get_llm_service),
):
    """Answer a buyer question using ONLY team listings."""
    try:
        rows = sheets.get_open_houses()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load listings: {exc}")

    listings = normalization_service.normalize_many(rows)
    filters, matches, used_embeddings = listing_search_service.search(
        listings, request.query, embedding_service=embeddings, limit=request.limit
    )
    answer = llm.recommend(request.query, matches, filters)

    return AskResponse(
        answer=answer,
        filters=filters,
        matches=matches,
        used_llm=llm.available,
        used_embeddings=used_embeddings,
    )
