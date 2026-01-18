# Future Feature Ideas

## Chat Box for Property Search (Requested 2026-01-12)

### Description
Add an interactive chat box interface to the Open Houses page that allows users to ask natural language questions about location and home prices.

### User Requirements
- User can type questions like:
  - "Show me homes under $800k in Bellevue"
  - "What's available in North Seattle for under $1M?"
  - "Find condos downtown under $700k"
- System processes natural language input
- Returns filtered open house listings based on query
- Interactive conversation-style interface

### Implementation Notes
- Can be added after Step 3 (after modal is complete)
- Requires:
  - Natural language processing for location and price extraction
  - Chat UI component (similar to customer service chat boxes)
  - Integration with existing fetchOpenHouses API
  - Support for multiple query formats
- Could use simple keyword matching initially, or integrate with AI for more sophisticated parsing

### Priority
- Medium (nice-to-have enhancement after MVP is complete)

---

## Other Future Enhancements

### AI-Powered Recommendations
- Recommend properties based on user preferences and search history

### Saved Searches
- Allow users to save their filter preferences
- Email notifications when new properties match their criteria

### Virtual Tour Integration
- Embed 3D virtual tours or video walkthroughs

### Neighborhood Data
- Add school ratings, crime statistics, commute times
- Transit scores and walkability metrics
