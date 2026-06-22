"""Google Sheet listing ingestion.

Reads the ``open_house_picks`` tab and writes to the ``leads`` tab. The Google
API client is built lazily on first use so the app can boot (and serve health
checks) even when credentials are not configured locally.
"""

import json
from typing import Any, Dict, List

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.config import Settings

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]


class GoogleSheetService:
    """Thin wrapper over the Google Sheets v4 API."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self._service = None

    # -- lazy client -------------------------------------------------------
    def _client(self):
        if self._service is not None:
            return self._service

        file_path = self.settings.google_service_account_file
        json_blob = self.settings.google_service_account_json

        if file_path:
            credentials = Credentials.from_service_account_file(file_path, scopes=SCOPES)
        elif json_blob:
            try:
                info = json.loads(json_blob)
            except json.JSONDecodeError as exc:
                raise ValueError(
                    f"Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: {exc}"
                ) from exc
            credentials = Credentials.from_service_account_info(info, scopes=SCOPES)
        else:
            raise ValueError(
                "Either GOOGLE_SERVICE_ACCOUNT_FILE or GOOGLE_SERVICE_ACCOUNT_JSON "
                "must be set to access Google Sheets."
            )

        if not self.settings.google_sheet_id:
            raise ValueError("GOOGLE_SHEET_ID is not configured.")

        self._service = build("sheets", "v4", credentials=credentials)
        return self._service

    # -- reads -------------------------------------------------------------
    def get_open_houses(self) -> List[Dict[str, Any]]:
        """Return raw open-house rows as dicts keyed by sheet header.

        Columns: id, address, area, open_house_time, redfin_url, notes, price,
        why_pick_1, why_pick_2, why_pick_3, tags, status.
        """
        try:
            range_name = f"{self.settings.open_house_tab}!A:L"
            result = (
                self._client()
                .spreadsheets()
                .values()
                .get(spreadsheetId=self.settings.google_sheet_id, range=range_name)
                .execute()
            )
            values = result.get("values", [])
            if not values:
                return []

            headers = values[0]
            rows: List[Dict[str, Any]] = []
            for row in values[1:]:
                if not row or not any(row):
                    continue
                while len(row) < len(headers):
                    row.append("")

                record: Dict[str, Any] = {}
                for i, header in enumerate(headers):
                    value = row[i] if i < len(row) else ""
                    if header == "id":
                        record[header] = int(value) if value else 0
                    elif header == "price":
                        clean = value.replace("$", "").replace(",", "").strip()
                        record[header] = int(clean) if clean else None
                    else:
                        record[header] = value

                if record.get("id"):
                    rows.append(record)
            return rows
        except HttpError as exc:
            raise Exception(f"Google Sheets API error: {exc}") from exc

    # -- writes ------------------------------------------------------------
    def create_lead(self, lead: Dict[str, Any]) -> None:
        """Append a lead row to the leads tab."""
        try:
            row = [
                lead.get("created_at", ""),
                lead.get("name", ""),
                lead.get("email", ""),
                lead.get("phone", ""),
                lead.get("message", ""),
                lead.get("source", ""),
                str(lead.get("listing_id", "") or ""),
                lead.get("listing_address", ""),
                lead.get("preferred_date", ""),
                lead.get("preferred_time", ""),
            ]
            range_name = f"{self.settings.leads_tab}!A:J"
            self._client().spreadsheets().values().append(
                spreadsheetId=self.settings.google_sheet_id,
                range=range_name,
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body={"values": [row]},
            ).execute()
        except HttpError as exc:
            raise Exception(f"Google Sheets API error: {exc}") from exc
