# GCP API Cost Analysis & Free Alternatives

## Current Paid API Usage

### 1. Street View Static API (`OpenHouseCard.tsx:21`)

**Current Code:**
```typescript
const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${encodeURIComponent(openHouse.address)}&key=${apiKey}`;
```

**Cost:** $7.00 per 1,000 requests (after free tier)

**Usage Pattern:** Every time a property card loads, it makes a Street View API request.

---

### 2. Maps JavaScript API (`PropertyMap.tsx:36`)

**Current Code:**
```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
```

**Cost:**
- Dynamic Maps: $7.00 per 1,000 loads
- Geocoding (line 75-79): $5.00 per 1,000 requests

**Usage Pattern:** Map loads once per page visit, but geocodes every property address.

---

## Cost Estimate (Monthly)

| API | Requests/Month | Cost |
|-----|----------------|------|
| Street View Static | ~500 (50 visits × 10 properties) | $3.50 |
| Maps JavaScript | ~50 page loads | $0.35 |
| Geocoding | ~500 (50 visits × 10 properties) | $2.50 |
| **Total** | | **~$6.35/month** |

*Note: Google provides $200/month free credit, so you may not pay anything initially. But costs can grow with traffic.*

---

## Free Alternatives

### Option A: Remove Street View, Keep Map Link (Recommended)

**For Street View (`OpenHouseCard.tsx`):**
- Replace Street View image with a gradient placeholder
- Keep the "View on Google Maps" link (clicking opens Google Maps - FREE)

**Pros:**
- Zero API cost
- Still functional - users can click to see the property on Google Maps
- Cleaner, faster loading

**Cons:**
- No preview image on card

---

### Option B: Use Property Photos from Google Sheet

**Add a column `image_url` to your Google Sheet:**
- Paste Redfin/Zillow listing photos manually
- Display those images instead of Street View

**Pros:**
- Better quality images (actual listing photos)
- Zero API cost

**Cons:**
- Manual work to add image URLs

---

### Option C: Remove Interactive Map, Use Static Links

**For PropertyMap (`PropertyMap.tsx`):**
- Remove the interactive Google Map entirely
- Each property card already has "View on Google Maps" link

**Pros:**
- Eliminates Maps JavaScript API cost
- Eliminates Geocoding cost
- Simpler codebase

**Cons:**
- No map overview of all properties

---

### Option D: Switch to Leaflet + OpenStreetMap (Free)

**Replace Google Maps with:**
- Leaflet.js (open source)
- OpenStreetMap tiles (free)
- Nominatim for geocoding (free, rate-limited)

**Pros:**
- Completely free
- No API key needed
- Full interactive map

**Cons:**
- Requires code rewrite
- Slightly different UI/UX

---

## Recommended Action Plan

### Quick Win (5 minutes)
1. Remove Street View API usage in `OpenHouseCard.tsx`
2. Use gradient placeholder with house icon
3. Keep "View on Google Maps" click-through link

### Optional (15 minutes)
1. Remove `PropertyMap.tsx` component
2. Or replace with Leaflet/OpenStreetMap

### Future Enhancement
1. Add `image_url` column to Google Sheet
2. Display actual listing photos (better UX anyway)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/OpenHouseCard.tsx` | Remove Street View API, add placeholder |
| `src/components/PropertyMap.tsx` | Remove or replace with Leaflet |
| `src/app/open-houses/page.tsx` | Remove PropertyMap import if deleting |
| `.env.local` | Can remove `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` if not needed |

---

## Summary

**Current:** Using 3 paid Google APIs
**Recommendation:** Remove Street View + remove/replace Map = **$0/month**
