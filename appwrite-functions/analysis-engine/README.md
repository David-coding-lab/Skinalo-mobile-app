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

## Optional Environment Variables

- `ANALYSIS_REQUEST_TIMEOUT_MS` (default: `20000`)
- `ANALYSIS_RETRY_ATTEMPTS` (default: `2`)
- `ANALYSIS_RETRY_BASE_DELAY_MS` (default: `500`)

## Authentication Requirement

- Function execution expects an authenticated Appwrite user context.
- Requests without `x-appwrite-user-id` are rejected with `401`.

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

Status calls can move a queued request into processing and may return `processing`, `completed`, or `failed`.

## Response Status Values

- `accepted`
- `processing`
- `completed`
- `failed`

## Prompt Guardrail

- `ANALYSIS_SYSTEM_PROMPT` is mandatory.
- This function does not use a fallback prompt.

## Troubleshooting

- `SERVER_MISCONFIGURED`: check missing Appwrite/Gemini env variables.
- `PROMPT_NOT_CONFIGURED`: set `ANALYSIS_SYSTEM_PROMPT` exactly.
- `INTERNAL_ERROR` on DB operations: verify `ANALYSIS_DATABASE_ID` and table IDs.
- `INTERNAL_ERROR` on user profile fetch: verify API key has users read scope.
