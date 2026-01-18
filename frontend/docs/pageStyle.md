Update the Home page UI to match a modern SaaS-style landing page (like the reference screenshot we discussed yesterday), not a simple centered H1 + two cards.

Constraints:
- Next.js App Router + Tailwind only (no external UI libs for now).
- Keep Navbar.
- Use a max width container, better spacing, and a more premium look.

Home page layout requirements:
1) Hero section:
   - Left aligned content (not centered)
   - Big headline: “Seattle Home Picks”
   - Subtitle: “Curated open houses and neighborhood guidance for Seattle-area buyers.”
   - Two CTA buttons:
     - Primary: “This Weekend Open Houses” -> /open-houses
     - Secondary: “Schedule a Tour” -> /contact
   - Optional small trust text under CTA: “Updated every Friday • No spam”

2) Feature highlights (3 cards in a row on desktop, stacked on mobile):
   - “Curated Picks” (short description)
   - “Commute & Transit Notes” (short description)
   - “Fast Tour Scheduling” (short description)

3) Team section:
   - Keep Meet Our Team but redesign cards:
     - Add initials avatar circle
     - Better typography
     - Optional badge: “Team Lead” / “Agent”
   - Replace placeholder names with variables at top of file for easy edit.

4) Footer:
   - Simple footer with site name + small disclaimer text:
     “Information provided is for general guidance only. Availability and details may change.”

Implementation:
- Only modify src/app/page.tsx and, if needed, refine components/ProfileCards.tsx for the new card style.
- Do NOT add fake phone numbers; leave contact fields blank or placeholder like “Email: TBD”.
- Return code changes with file paths.


Make it look like a polished landing page: larger typography, more whitespace, subtle borders/shadows, and consistent spacing. Avoid the “school project” centered layout.
