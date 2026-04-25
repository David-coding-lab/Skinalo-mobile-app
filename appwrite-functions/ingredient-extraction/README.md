# Ingredient Extraction Function

This Appwrite Function extracts skincare ingredient names from an image using Gemini API.

## Runtime

- Node.js 18+
- Entry: `src/main.js`

## Required function environment variables

- `GEMINI_API_KEY`: Your Google AI Studio API key.
- `GEMINI_MODEL`: Recommended `gemini-2.5-flash`.
- `GEMINI_SYSTEM_PROMPT`: Central prompt instruction used for every request.
- `INGREDIENT_MAX_IMAGE_BYTES`: Optional max decoded image bytes (default 6291456 / 6MB).
- `GEMINI_REQUEST_TIMEOUT_MS`: Optional timeout in milliseconds for the API request (default 15000 / 15 seconds).
- `GEMINI_RETRY_ATTEMPTS`: Optional number of retry attempts for transient errors (default 3).
- `GEMINI_RETRY_BASE_DELAY_MS`: Optional base delay multiplier for exponential backoff (default 500).

## Request body

```json
{
  "imageBase64": "...",
  "mimeType": "image/jpeg",
  "selectedCategory": "Cleanser"
}
```

## Response shape

Success:

```json
{
  "ok": true,
  "ingredients": ["Water", "Glycerin", "Niacinamide"]
}
```

Failure:

```json
{
  "ok": false,
  "errorCode": "NO_INGREDIENTS_FOUND",
  "error": "No ingredients detected. Try a clearer image."
}
```

## Security

- Requires authenticated Appwrite user context (`x-appwrite-user-id`).
- Allowed MIME types for images: `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`.
- Rejects invalid MIME types and oversized images before calling Gemini.
- Keeps Gemini API key server-side only.
