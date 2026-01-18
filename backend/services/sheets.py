import os
import json
from typing import List, Dict, Any
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

class SheetsService:
    """
    Service to interact with Google Sheets API.
    Reads open houses and writes leads to Google Sheets.
    """

    def __init__(self):
        """Initialize Google Sheets API client."""
        # Get credentials from file path or JSON string
        service_account_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
        service_account_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")

        scopes = ["https://www.googleapis.com/auth/spreadsheets"]

        if service_account_file:
            # Load credentials from file
            credentials = Credentials.from_service_account_file(
                service_account_file, scopes=scopes
            )
        elif service_account_json:
            # Parse JSON credentials from environment variable
            try:
                service_account_info = json.loads(service_account_json)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: {e}")
            credentials = Credentials.from_service_account_info(
                service_account_info, scopes=scopes
            )
        else:
            raise ValueError(
                "Either GOOGLE_SERVICE_ACCOUNT_FILE or GOOGLE_SERVICE_ACCOUNT_JSON must be set"
            )

        # Build the service
        self.service = build("sheets", "v4", credentials=credentials)
        self.spreadsheet_id = os.getenv("GOOGLE_SHEET_ID")
        self.open_house_tab = os.getenv("OPEN_HOUSE_TAB", "open_house_picks")
        self.leads_tab = os.getenv("LEADS_TAB", "leads")

        if not self.spreadsheet_id:
            raise ValueError("GOOGLE_SHEET_ID environment variable not set")

    def get_open_houses(self) -> List[Dict[str, Any]]:
        """
        Read open houses from the 'open_house_picks' sheet.

        Expected columns:
        id, address, area, open_house_time, redfin_url, notes, price

        Returns:
            List of open house dictionaries
        """
        try:
            # Read data from the sheet
            range_name = f"{self.open_house_tab}!A:G"  # Columns A through G

            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_name
            ).execute()

            values = result.get("values", [])

            if not values:
                return []

            # First row is headers
            headers = values[0]
            open_houses = []

            # Process each row (skip header)
            for row in values[1:]:
                # Skip empty rows
                if not row or not any(row):
                    continue

                # Pad row with empty strings if needed
                while len(row) < len(headers):
                    row.append("")

                # Create dictionary from row
                open_house = {}
                for i, header in enumerate(headers):
                    value = row[i] if i < len(row) else ""

                    # Convert specific fields to appropriate types
                    if header == "id":
                        open_house[header] = int(value) if value else 0
                    elif header == "price":
                        # Remove $ and commas, convert to int
                        clean_price = value.replace("$", "").replace(",", "").strip()
                        open_house[header] = int(clean_price) if clean_price else None
                    else:
                        open_house[header] = value

                # Only add if it has an id
                if open_house.get("id"):
                    open_houses.append(open_house)

            return open_houses

        except HttpError as e:
            raise Exception(f"Google Sheets API error: {e}")
        except Exception as e:
            raise Exception(f"Error reading open houses: {e}")

    def create_lead(self, lead_data: Dict[str, Any]) -> None:
        """
        Write a lead to the 'leads' sheet.

        Expected columns:
        created_at, name, email, phone, message, source, listing_id, listing_address

        Args:
            lead_data: Dictionary containing lead information
        """
        try:
            # Prepare row data in correct order
            row = [
                lead_data.get("created_at", ""),
                lead_data.get("name", ""),
                lead_data.get("email", ""),
                lead_data.get("phone", ""),
                lead_data.get("message", ""),
                lead_data.get("source", ""),
                str(lead_data.get("listing_id", "")),
                lead_data.get("listing_address", ""),
            ]

            # Append row to sheet
            range_name = f"{self.leads_tab}!A:H"

            body = {
                "values": [row]
            }

            self.service.spreadsheets().values().append(
                spreadsheetId=self.spreadsheet_id,
                range=range_name,
                valueInputOption="RAW",
                insertDataOption="INSERT_ROWS",
                body=body
            ).execute()

        except HttpError as e:
            raise Exception(f"Google Sheets API error: {e}")
        except Exception as e:
            raise Exception(f"Error writing lead: {e}")

    def test_connection(self) -> bool:
        """
        Test the connection to Google Sheets.

        Returns:
            True if connection is successful, False otherwise
        """
        try:
            # Try to read spreadsheet metadata
            self.service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()
            return True
        except Exception:
            return False
