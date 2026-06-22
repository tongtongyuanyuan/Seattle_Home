# Future Improvements

This document outlines potential improvements and features to implement later.

> **Note on paths / status:** Some snippets below predate the restructure and a
> few features are already built. Current layout is **`backend/app/...`** (Poetry —
> add deps with `poetry add`, not `requirements.txt`) and **`apps/web/...`** (not
> `frontend/`). Already implemented: **lead email notifications**
> (`backend/app/services/email_service.py`) and the **LLM chat**, which now uses
> **Anthropic Claude** in `backend/app/services/llm_service.py` (see
> `docs/LLM_CHAT.md`) — not the OpenAI snippets shown here.

---

## 1. Lead Email Notifications

### Current State
Leads are saved to Google Sheet `leads` tab only. No email notifications.

### Goal
Send instant email notifications to team leads when new leads come in.

### Options

#### Option A: Google Apps Script (FREE - Recommended)

**Setup Steps:**
1. Open your Google Sheet
2. Go to Extensions → Apps Script
3. Paste this code:

```javascript
// Check for new leads every 5 minutes
var lastRowProcessed = PropertiesService.getScriptProperties();

function createTrigger() {
  ScriptApp.newTrigger('checkNewLeads')
    .timeDriven()
    .everyMinutes(5)
    .create();
}

function checkNewLeads() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('leads');
  var lastRow = sheet.getLastRow();
  var stored = lastRowProcessed.getProperty('lastRow') || '1';

  if (lastRow > parseInt(stored)) {
    for (var i = parseInt(stored) + 1; i <= lastRow; i++) {
      var data = sheet.getRange(i, 1, 1, 8).getValues()[0];
      sendNotification(data);
    }
    lastRowProcessed.setProperty('lastRow', lastRow.toString());
  }
}

function sendNotification(data) {
  var name = data[1];
  var email = data[2];
  var phone = data[3];
  var message = data[4];
  var source = data[5];

  var subject = '🏠 New Lead: ' + name;
  var body = 'New lead received!\n\n' +
    'Name: ' + name + '\n' +
    'Email: ' + email + '\n' +
    'Phone: ' + phone + '\n' +
    'Source: ' + source + '\n\n' +
    'Message:\n' + message;

  // UPDATE WITH YOUR TEAM EMAILS
  var teamEmails = ['tongxue616@gmail.com', 'rachelxue@kw.com'];
  teamEmails.forEach(function(recipient) {
    MailApp.sendEmail(recipient, subject, body);
  });
}
```

4. Update `teamEmails` with actual email addresses
5. Run `createTrigger()` once
6. Authorize when prompted

#### Option B: Resend API (Backend Integration)

Add to `backend/requirements.txt`:
```
resend
```

Add to `backend/.env`:
```
RESEND_API_KEY=re_xxxxx
TEAM_EMAIL=tongxue616@gmail.com,rachelxue@kw.com
```

Update `backend/main.py`:
```python
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

async def send_lead_notification(lead_data: dict):
    team_emails = os.getenv("TEAM_EMAIL", "").split(",")

    resend.Emails.send({
        "from": "Seattle Home Picks <leads@yourdomain.com>",
        "to": team_emails,
        "subject": f"🏠 New Lead: {lead_data['name']}",
        "html": f"""
            <h2>New Lead Received!</h2>
            <p><strong>Name:</strong> {lead_data['name']}</p>
            <p><strong>Email:</strong> {lead_data['email']}</p>
            <p><strong>Phone:</strong> {lead_data['phone']}</p>
            <pre>{lead_data['message']}</pre>
        """
    })

# Call in /leads endpoint after sheets_service.create_lead()
```

#### Option C: Zapier (No-code)

1. Create Zapier account
2. Trigger: Google Sheets → New Row in `leads`
3. Action: Gmail → Send Email
4. Map fields to email template

---

## 2. Street View Images (Paid Option)

### Current State
Using gradient placeholders (free).

### To Enable Street View
1. Restore code from `frontend/docs/OpenHouseCard_WithAPI.md`
2. Enable Street View Static API in GCP
3. Add API key to `.env.local`

**Cost:** ~$7 per 1,000 images

---

## 3. Interactive Map (Paid Option)

### Current State
Removed to save costs.

### To Enable
1. Restore code from `frontend/docs/PropertyMap_WithAPI.md`
2. Enable Maps JavaScript API + Geocoding API in GCP
3. Add API key to `.env.local`

**Cost:** ~$7 per 1,000 map loads + $5 per 1,000 geocodes

---

## 4. Property Ratings/Reviews

### Current State
Users click "View on Google Maps" to see ratings.

### Future Option
Add columns to Google Sheet:
- `rating` (e.g., 4.6)
- `reviews_count` (e.g., 328)

Display on cards - no API cost.

---

## 5. SMS Notifications

### Option: Twilio

Add to `backend/requirements.txt`:
```
twilio
```

```python
from twilio.rest import Client

client = Client(os.getenv("TWILIO_SID"), os.getenv("TWILIO_TOKEN"))

client.messages.create(
    body=f"New lead: {name} - {phone}",
    from_="+1234567890",
    to="+1987654321"
)
```

---

## 6. Analytics Dashboard

### Option: Simple Stats Page

Create `/admin` page showing:
- Total leads this week/month
- Leads by source (contact vs open house)
- Most viewed listings

Data from Google Sheets API.

---

## 7. Saved Favorites

Allow users to:
- Save favorite listings (localStorage)
- Share favorites via link
- Get notified when favorited listing has open house

---

## 8. Calendar Integration

Add "Add to Calendar" button for open houses:
- Google Calendar link
- Apple Calendar (.ics file)

---

## 9. LLM-Powered Conversational Assistant

### Vision: 有人味的买房决策助手 (Human-like Home Buying Assistant)

**✅ What we want:**
- A warm, conversational Seattle home buying **decision assistant**
- Feels like chatting with a knowledgeable local friend
- Understands context, asks follow-up questions
- Provides insights about neighborhoods, not just listings
- Helps with **decision-making**, not just searching

**❌ What we DON'T want:**
- A Zillow/Redfin replacement (cold, transactional search)
- Just a filter interface with natural language
- Generic responses without personality

### Current State
Chat widget uses **rule-based keyword matching**:
- Works: "homes under $900k in Bellevue"
- Fails: "I want a good home within 30 mins of Seattle"

### Goal
Create a conversational assistant that can:
- Understand natural language: "around 900k", "safe area", "30 mins from downtown"
- Remember conversation context for follow-ups
- Provide Seattle neighborhood insights
- Ask clarifying questions when needed
- Give personalized recommendations with reasoning

### Phase 1: Basic LLM Search (OpenAI API)

**Cost:** ~$0.001 per chat message (GPT-3.5-turbo)
**Monthly estimate (1000 queries):** $0.20 - $1.00

#### Implementation Steps

1. Add to `backend/requirements.txt`:
```
openai==1.12.0
```

2. Add to `backend/.env`:
```
OPENAI_API_KEY=sk-xxxxx
```

3. Create `backend/services/llm.py`:
```python
from openai import OpenAI
import json
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are a Seattle real estate assistant.
Extract search criteria from user queries and return JSON.

Available areas: Seattle, Bellevue, Kirkland, Redmond, Issaquah, Renton, Mercer Island, Eastside, North Seattle, Downtown

Return JSON with these fields (all optional):
- max_budget: number (e.g., 900000)
- min_budget: number
- areas: list of area names
- day: "Saturday" or "Sunday" or null
- preferences: list of keywords like "schools", "commute", "views", "transit", "safe"
- commute_to: city name if they mention commute destination

Example input: "I want a home under $900k near good schools in Bellevue"
Example output: {"max_budget": 900000, "areas": ["Bellevue"], "preferences": ["schools"]}

Example input: "homes within 30 mins of downtown Seattle"
Example output: {"areas": ["Seattle", "Bellevue", "Kirkland"], "commute_to": "Seattle", "preferences": ["commute"]}

Example input: "safe area around 900k and 30mins from downtown"
Example output: {"max_budget": 900000, "areas": ["Seattle", "Bellevue", "Kirkland"], "preferences": ["safe", "commute"], "commute_to": "Seattle"}

If the query is unclear, make reasonable assumptions for Seattle area home buyers.
Always return valid JSON only, no other text.
"""

async def extract_search_filters(user_query: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_query}
        ],
        temperature=0.3,
        max_tokens=200
    )

    try:
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return {}
```

4. Add endpoint to `backend/main.py`:
```python
from services.llm import extract_search_filters
from pydantic import BaseModel

class ChatQuery(BaseModel):
    query: str

@app.post("/chat")
async def chat_search(chat_query: ChatQuery):
    # Extract filters using LLM
    filters = await extract_search_filters(chat_query.query)

    # Get all houses
    all_houses = sheets_service.get_open_houses()

    # Apply filters
    results = all_houses

    if filters.get("max_budget"):
        results = [h for h in results if h.get("price", 0) <= filters["max_budget"]]

    if filters.get("min_budget"):
        results = [h for h in results if h.get("price", 0) >= filters["min_budget"]]

    if filters.get("areas"):
        results = [h for h in results if any(
            area.lower() in h.get("area", "").lower() or
            area.lower() in h.get("address", "").lower()
            for area in filters["areas"]
        )]

    if filters.get("day"):
        results = [h for h in results if filters["day"].lower() in h.get("open_house_time", "").lower()]

    # Return top 10
    return {
        "filters_extracted": filters,
        "homes": results[:10],
        "total_found": len(results)
    }
```

5. Update `frontend/src/components/ChatWidget.tsx`:
```typescript
const handleSubmit = async (query: string) => {
  if (!query.trim()) return;

  setIsLoading(true);
  setMessages(prev => [...prev, { role: 'user', content: query }]);
  setInput('');

  try {
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    const explanation = data.total_found > 0
      ? `Found ${data.total_found} home${data.total_found !== 1 ? 's' : ''} matching your criteria:`
      : "I couldn't find exact matches, but here are some great picks:";

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: explanation,
      homes: data.homes,
    }]);
  } catch (error) {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: "Sorry, I had trouble searching. Please try again.",
    }]);
  }

  setIsLoading(false);
};
```

### Alternative: Claude API (Anthropic)

```python
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

async def extract_search_filters(user_query: str) -> dict:
    message = client.messages.create(
        model="claude-3-haiku-20240307",  # Cheapest, fastest
        max_tokens=200,
        messages=[
            {"role": "user", "content": f"{SYSTEM_PROMPT}\n\nUser query: {user_query}"}
        ]
    )
    return json.loads(message.content[0].text)
```

**Cost:** Claude 3 Haiku is ~$0.0002 per query (cheaper than GPT-3.5)

### Example Query Mappings

| User Query | LLM Extracts |
|------------|--------------|
| "good home within 30 mins of Seattle" | `{"areas": ["Seattle", "Bellevue", "Kirkland"], "commute_to": "Seattle"}` |
| "something nice for a family" | `{"preferences": ["schools", "family"]}` |
| "affordable starter home" | `{"max_budget": 700000, "preferences": ["value"]}` |
| "luxury with views" | `{"min_budget": 1000000, "preferences": ["views"]}` |
| "close to Microsoft" | `{"areas": ["Redmond", "Bellevue"], "commute_to": "Redmond"}` |
| "safe area around 900k" | `{"max_budget": 900000, "preferences": ["safe"]}` |

---

### Phase 2: Conversational Assistant (Enhanced)

Beyond basic search, make the assistant truly conversational and human-like.

#### Enhanced System Prompt for Personality

```python
CONVERSATIONAL_PROMPT = """You are Rachel's assistant at Seattle Home Picks - a friendly,
knowledgeable Seattle real estate helper. Think of yourself as a local friend who
happens to know a lot about Seattle neighborhoods.

PERSONALITY:
- Warm and approachable, not salesy
- Genuinely helpful, like a friend giving advice
- Knowledgeable about Seattle neighborhoods
- Ask clarifying questions when helpful
- Share insights, not just listings

CONVERSATION STYLE:
- Use natural, conversational language
- Remember what the user said earlier in the conversation
- If unsure, ask follow-up questions instead of guessing
- Explain WHY you're recommending something
- Share local knowledge (commute times, neighborhood vibes, school districts)

SEATTLE KNOWLEDGE:
- Eastside (Bellevue, Kirkland, Redmond): Tech hubs, good schools, family-friendly
- Seattle (Downtown, Capitol Hill): Urban, walkable, transit access
- North Seattle (Northgate, Lake City): More affordable, light rail access
- South Seattle (Renton): Value-oriented, diverse communities
- Mercer Island: Quiet, upscale, great schools
- Issaquah: Mountain views, outdoor lifestyle, good schools

RESPONSE FORMAT:
When showing homes, always explain your reasoning:
"Based on your budget and preference for good schools, I found 3 homes in Bellevue
that might work well. The Eastside generally has top-rated school districts..."

When you need more info, ask naturally:
"I'd love to help! A few quick questions - are you looking for a single family home
or would a townhouse work too? And is being close to transit important for you?"
"""
```

#### Conversation Memory (Multi-turn)

Store conversation history to enable follow-ups:

```python
# backend/main.py
from typing import List

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.post("/chat")
async def conversational_chat(request: ChatRequest):
    # Build messages with history
    messages = [{"role": "system", "content": CONVERSATIONAL_PROMPT}]

    # Add conversation history
    for msg in request.history[-10:]:  # Keep last 10 messages
        messages.append({"role": msg.role, "content": msg.content})

    # Add current message
    messages.append({"role": "user", "content": request.message})

    # Get available homes for context
    homes = sheets_service.get_open_houses()
    homes_context = format_homes_for_llm(homes)  # Summarize available inventory

    messages.append({
        "role": "system",
        "content": f"Current inventory:\n{homes_context}"
    })

    response = client.chat.completions.create(
        model="gpt-4-turbo",  # Better for conversation
        messages=messages,
        temperature=0.7,  # More creative/natural
        max_tokens=500
    )

    return {
        "response": response.choices[0].message.content,
        "homes": extract_recommended_homes(response, homes)  # Parse any home IDs mentioned
    }
```

#### Key Principles (from chat.md: 受限聊天 Guided Chat)

**Critical:** This is NOT a ChatGPT clone. It's a guided, bounded assistant.

```
✅ DO:
- Answer real buyer questions, grounded ONLY in YOUR picks (from Google Sheet)
- Parse user intent: budget, area, keywords (school/commute/value)
- Return 2-3 matching homes with WHY explanations
- "Redfin gives me data, YOU tell me how to judge"

❌ DON'T:
- Chat about anything unrelated to home buying
- Make up listings that aren't in your sheet
- Give generic advice without referencing specific homes
- Pretend to know about homes you don't have
```

#### Example Conversations

**Conversation 1: Clarifying Questions**
```
User: "Hi, I'm looking for a home in Seattle"
```

---

## Real listing images without paid APIs (Redfin OG extraction)
Instead of the paid Street View Static API, pull each listing's hero photo
server-side from its `redfin_url` Open Graph tags:
- Fetch the Redfin page (with a `User-Agent` header), read `og:image` /
  `twitter:image`; in-memory cache (24h TTL), 5s timeout, placeholder on error.
- Add `image_url` to the listing payload and render with `next/image`
  (allow `*.redfin.com` / `ssl.cdn-redfin.com` in `next.config` `remotePatterns`).
- Simpler alternative: add an `image_url` column to the Google Sheet and paste photos.
