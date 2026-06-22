"""Email notifications for new leads / tour requests.

Uses Python's stdlib ``smtplib`` — no extra dependency. When a tour request comes
in, the agent team is emailed the details. If SMTP isn't configured the service
is a graceful no-op (logs and returns ``False``) so a missing config never breaks
lead capture.

To enable (e.g. Gmail), set in ``backend/.env``:
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USERNAME=you@gmail.com
    SMTP_PASSWORD=<16-char Gmail App Password>
    FROM_EMAIL=you@gmail.com
    NOTIFY_EMAILS=you@gmail.com,teammate@kw.com
"""

import logging
import smtplib
from email.message import EmailMessage
from typing import Any, Dict

from app.config import Settings

logger = logging.getLogger("uvicorn.error")


class EmailService:
    def __init__(self, settings: Settings):
        self.settings = settings

    @property
    def available(self) -> bool:
        return self.settings.email_enabled

    def send_lead_notification(self, lead: Dict[str, Any]) -> bool:
        """Email the agent team about a new lead. Returns True if actually sent."""
        if not self.available:
            logger.info(
                "Email not configured; skipping notification for lead %s",
                lead.get("email"),
            )
            return False
        try:
            msg = EmailMessage()
            who = lead.get("name") or "Someone"
            msg["Subject"] = f"🏡 New tour request from {who}"
            msg["From"] = self.settings.from_email or self.settings.smtp_username
            msg["To"] = ", ".join(self.settings.notify_recipients)
            if lead.get("email"):
                msg["Reply-To"] = lead["email"]
            msg.set_content(self._body(lead))

            with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port) as server:
                server.starttls()
                server.login(self.settings.smtp_username, self.settings.smtp_password)
                server.send_message(msg)

            logger.info("Sent lead notification to %s", self.settings.notify_recipients)
            return True
        except Exception as exc:  # never fail the request because email failed
            logger.error("Failed to send lead notification: %s", exc)
            return False

    @staticmethod
    def _body(lead: Dict[str, Any]) -> str:
        lines = [
            "You have a new tour request / lead:",
            "",
            f"Name:   {lead.get('name', '')}",
            f"Email:  {lead.get('email', '')}",
            f"Phone:  {lead.get('phone', '')}",
        ]
        when = " ".join(
            x for x in [lead.get("preferred_date"), lead.get("preferred_time")] if x
        )
        if when:
            lines.append(f"Preferred tour time: {when}")
        if lead.get("listing_address"):
            lines.append(f"Listing: {lead.get('listing_address')}")
        lines += [
            f"Source: {lead.get('source', '')}",
            "",
            "Message:",
            lead.get("message", "") or "(none)",
            "",
            f"Received: {lead.get('created_at', '')}",
        ]
        return "\n".join(lines)
