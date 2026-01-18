Update ProfileCards component to support profile avatars.

Requirements:
- Each profile can optionally have an avatar image.
- Avatar is a circle, 64px on desktop, centered on top of the card.
- If avatar is provided, show the image.
- If avatar is missing, show a colored circle with initials (first letters of name).

Implementation details:
- Avatar images are stored in /public/avatars
- Use Next.js <Image /> for avatars
- Initials fallback: background gray-200, text gray-700, font-semibold

Update:
- src/components/ProfileCards.tsx
- Update Home page usage accordingly

Return code with file paths.
