# CLAUDE.md — Seattle Home Picks Product Upgrade (Team Listings Only)

## Goal (Product Positioning)
We are NOT building a Zillow/Redfin clone.
We only show curated/team listings (from our Google Sheet) and help users decide WHY each pick is good.

## Non-goals
- No web scraping of Zillow/Redfin
- No “chat about anything” general chatbot
- No heavy Google Maps paid APIs unless explicitly necessary

## Data Source
Google Sheet is the single source of truth.

Expected columns (current):
- id
- address
- area
- open_house_time
- redfin_url
- notes
- price

## New columns to add (please add support in code even if missing initially)
Add these optional fields to sheet parsing:
- why_pick_1
- why_pick_2
- why_pick_3
- tags (comma-separated, e.g. "good_schools,commute,value,views")
- google_maps_url (optional; can be generated)
- street_view_url (optional; can be generated)

If the why_pick fields are missing, derive from notes (split sentences, or fallback to notes as single “Why” line).


---

# Part 1 — Turn Home Page Cards into Real Features

## 1) Curated Picks Card => Explainable Picks
### UX Requirements
- In Open Houses list cards, add a “Why we picked this” section.
- Default view shows 1 short line.
- Expand/collapse to show up to 3 bullet points.

### Logic
- If why_pick_1/2/3 exist -> use them.
- Else fallback to parsing notes into up to 3 bullet points.
- If neither exists -> show “Curated by our team based on value, location, and timing.”

### Acceptance Criteria
- Every listing card has a visible “Why we picked this” block.
- Must not break if sheet columns are missing.

## 2) Local Expertise Card => Guided Q&A (NOT full chatbot)
Create a new page:
- Route: /ask
- Nav label: “Ask”
- Home card “Local Expertise” becomes a link/button to /ask.

### UX on /ask
- A chat-like UI (simple).
- At top: 4-6 quick prompt buttons:
  - “Best value homes under $900k”
  - “Good commute to Bellevue”
  - “Near light rail / transit friendly”
  - “Good schools focus”
  - “Show me Saturday open houses”
- User can also type.

### Response must be grounded ONLY in sheet picks
- Parse user input for:
  - max budget (e.g. under 900k)
  - area keywords (Bellevue, Issaquah, etc)
  - day/time keywords (Sat/Sun)
  - preference keywords (schools/commute/value/transit)
- Filter the existing picks list.
- Return:
  - Top 3 matching homes
  - Each includes: address, price, open house time, and 1-2 why bullets (from why_pick or notes)
  - If no matches -> suggest broadening filters and show 3 “closest” picks.

### Implementation Notes
- This can be purely client-side using the already fetched open houses list.
- Do NOT call OpenAI or external LLM APIs for now.
- Keep logic deterministic/rule-based.

### Acceptance Criteria
- /ask page works with no API keys.
- Answers always reference homes from our list.
- Clicking a recommended home takes user to /open-houses and scroll/highlight that card (or open a modal).

## 3) Professional Service Card => Upgrade Contact into Real Lead Capture
Current /contact is a basic form. Upgrade it to a short stepper (3 steps).

### Stepper Requirements
Step 1: “What are you looking for?”
- Just browsing
- Tour this weekend
- Buying in 1–3 months
- Selling / listing

Step 2: “Budget range”
- < $800k
- $800k–$1M
- $1M+

Step 3: “Preferred areas + message”
- areas multi-select OR free text
- message textarea

### Output handling
- For MVP: just show a success toast and log payload to console.
- If there is an existing backend endpoint, POST there.
- Store in a simple local JSON file only if backend exists; otherwise keep client-side.

### Acceptance Criteria
- Multi-step form works on mobile.
- Submit yields a structured payload: {intent, budgetRange, areas, message, name, email, phone}

---

# Part 2 — Make Listing Cards Better (Team Listings only)

## Listing Card Enhancements (/open-houses)
### Required fields to show:
- Street view image (or embed preview)
- Address, area, open house time
- Price
- “Why we picked this”
- Buttons: View on Redfin, View on Google Maps, Schedule a Tour

### Street View / Map requirements (low-cost)
- Prefer Google Maps Embed / public image approaches.
- If you already have a working embed (like current screenshot), keep it.
- If there’s no imagery, show a graceful placeholder (“No imagery available”) but still show buttons.

### Generate links if missing
- Google Maps link:
  https://www.google.com/maps/search/?api=1&query=<urlencoded_address>
- Embed can use standard maps embed patterns without new paid APIs.

Acceptance Criteria
- All cards have "View on Google Maps" link.
- Street imagery works without requiring paid APIs.
- No hard crash if image fails.

---

# Part 3 — Add “Team Listings Only” Guardrails

## Data rules
- Only show rows from the sheet.
- Add optional column: status (Active / Inactive)
- If status exists, only show Active.

## UI
- Add small badge on top: “Team Curated Picks — Updated Weekly”
- Add count “Found X open houses”

Acceptance Criteria
- Changing sheet updates the site without redeploying (if your sheet fetch is runtime).
- Inactive listings never show.

---

# Deliverables / Checklist
1. Home page cards become clickable feature entry points:
   - Curated Picks => /open-houses (with Explainable Picks)
   - Local Expertise => /ask
   - Professional Service => /contact (stepper)
2. /ask page implemented with deterministic filtering + recommendations
3. Listing cards display Why + map links + imagery fallback
4. Optional new sheet columns supported without breaking existing data

---

# How to Work (Important)
- Make small commits.
- After each part, run the app locally and verify routes.
- Keep styling consistent with existing design (buttons/cards spacing).
- Avoid adding new paid APIs unless required.

🏡 1️⃣ Curated Picks →「为什么是这套？」
现在：

Hand-selected open houses…

改成：

一个可解释的推荐系统（Explainable Picks）

具体怎么做（非常可落地）

👉 每一套房子，加一个 “Why we picked this” 小模块：
Why this pick:
• Price is below neighborhood median by ~$120k
• Walkable to future light rail (2026)
• Strong school district for <$1M range
📌 数据来源：

你 sheet 里 already 有 notes

后期可以加一些规则（不用 ML）

📌 前端表现：

卡片底部一个「💡 Why we picked this」

点开是 3–4 行解释

📌 用户价值：

Redfin 给我数据，你告诉我怎么判断

这一步 不需要新 API、不花钱、但“产品感”直接翻倍。

📍 2️⃣ Local Expertise →「问问题，而不是看文字」

这是你刚才提到的 chat idea，而且这个想法 非常合理 👍
但要注意：不是做一个 ChatGPT 克隆

正确姿势：受限聊天（Guided Chat）
✅ 要做：

“Answer real buyer questions, grounded in your picks”
一个非常好的 MVP 设计（我强烈推荐）
页面入口

Home → 「Ask a local expert」

💬 Try asking:
• I’m looking for homes under $900k near good schools
• Which areas are good for Eastside commute?
• Any good value homes this weekend?
后端逻辑（不用很复杂）：

用户输入

解析：

预算

区域

关键词（school / commute / value）

只从你 sheet 里的房子里筛

返回：

2–3 套房

一段 explanation（你现在 notes 就够）

📌 重点：

不是“AI很聪明”，而是“推荐结果有来源、有边界”

💼 3️⃣ Professional Service →「从表单升级成转化工具」

你现在的 Contact 页面，其实是 标准表单，但可以升一档。

一个简单但非常“实战”的升级方案
表单改成分段式（Progressive）

第一步（轻）：

What are you looking for?
◯ Just browsing
◯ Open house this weekend
◯ Ready to buy in 3 months


第二步（条件）：

Budget range:
◯ <$800k
◯ $800k–$1M
◯ $1M+


第三步：

Anything specific?
[ free text ]


📌 好处：

你能 提前判断线索质量

后续可以接 CRM / email

比“一个大 message 框”强很多