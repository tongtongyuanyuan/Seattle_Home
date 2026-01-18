# Admin Workflow: Managing Open Houses Weekly

## Overview
This guide explains how to update the Google Sheet with new open house listings each week.

## Google Sheet Structure

**Sheet URL:** https://docs.google.com/spreadsheets/d/1KAnV5cF1Bc_xPOyW3g3zFHN_dkP-nAOofx3Fhdwq9Kk/edit

### Tab 1: `open_house_picks`
This tab contains the listings shown on the website.

| Column | Description | Example |
|--------|-------------|---------|
| id | Unique number for each listing | 1, 2, 3... |
| address | Full property address | 721 S 20th St, Renton, WA 98055 |
| area | Neighborhood/region | Renton Highlands, Somerset, Lynnwood |
| open_house_time | Day and time of open house | Sat 1-4 PM, Sun 12-3 PM |
| redfin_url | Link to Redfin listing | https://www.redfin.com/... |
| notes | Agent notes for buyers | Great value, close to I-405 |
| price | Listing price (number only) | 815000 |

### Tab 2: `leads`
This tab receives form submissions from the website (read-only for admins).

| Column | Description |
|--------|-------------|
| created_at | Timestamp of submission |
| name | Customer name |
| email | Customer email |
| phone | Customer phone |
| message | Customer message |
| source | Where they submitted from (open_house or contact) |
| listing_id | ID of listing they inquired about |
| listing_address | Address they inquired about |

---

## Weekly Update Process

### Step 1: Clear Old Listings (Friday)
1. Open the Google Sheet
2. Go to `open_house_picks` tab
3. Select all data rows (not the header row)
4. Delete the rows (right-click → Delete rows)

### Step 2: Add New Listings
1. For each open house this weekend:
   - Add a new row
   - Fill in all columns
   - Make sure `id` is unique (1, 2, 3...)
   - Use consistent area names
   - Format price as number only (no $ or commas)

### Step 3: Verify
1. Visit the website: http://localhost:3000/open-houses (or production URL)
2. Confirm all listings appear correctly
3. Test the filters (area, day)

---

## Tips

### Area Names (Use Consistently)
- Renton Highlands
- Somerset
- Lynnwood
- Shoreline
- Bothell
- Newcastle
- Queen Anne
- Factoria
- South Seattle

### Price Format
- Use numbers only: `815000` (not `$815,000`)
- The website will format it automatically

### Redfin URL
- Copy the full URL from Redfin
- Example: `https://www.redfin.com/WA/Renton/721-S-20th-St-98055/home/123456`

### Open House Time Format
- Include day: `Sat 1-4 PM` or `Sun 12-3 PM`
- Use consistent format for filtering to work

---

## Checking Leads

1. Open the Google Sheet
2. Go to `leads` tab
3. New leads appear at the bottom
4. Follow up with customers promptly

---

## Troubleshooting

### Listings not appearing?
- Check that the header row matches exactly: `id`, `address`, `area`, `open_house_time`, `redfin_url`, `notes`, `price`
- Make sure `id` column has a number
- Refresh the website (Ctrl+R / Cmd+R)

### Filters not working?
- Check `area` column matches expected values
- Check `open_house_time` includes "Sat" or "Sun"
