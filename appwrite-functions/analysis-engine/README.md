# Analysis Engine Function

Appwrite cloud function for cached, profile-aware skincare analysis.

## Runtime

- Node.js 18+
- Entry: `src/main.js`

## Required Environment Variables

- `APPWRITE_API_KEY`
- `APPWRITE_FUNCTION_API_ENDPOINT`
- `APPWRITE_FUNCTION_PROJECT_ID`
- `ANALYSIS_DATABASE_ID`
- `ANALYSIS_REQUESTS_TABLE_ID` (default: `analysis_requests`)
- `ANALYSIS_CACHE_TABLE_ID` (default: `analysis_cache`)
- `ANALYSIS_EVENTS_TABLE_ID` (default: `analysis_events`)
- `GEMINI_API_KEY`
- `ANALYSIS_MODEL` (default: `gemini-2.5-flash`)
- `ANALYSIS_MODEL_VERSION`
- `ANALYSIS_PROMPT_VERSION`
- `ANALYSIS_SYSTEM_PROMPT` (locked prompt text)

## Request Shape

Start analysis (cache-first):

```json
{
  "action": "start",
  "selectedCategory": "Cleanser",
  "ingredients": ["Water", "Glycerin", "Niacinamide"]
}
```

Poll status:

```json
{
  "action": "status",
  "analysisRequestId": "<row_id>"
}
```

## Response Status Values

- `accepted`
- `processing`
- `completed`
- `failed`
