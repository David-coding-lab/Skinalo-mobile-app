import { Buffer } from "node:buffer";

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const FALLBACK_SYSTEM_PROMPT =
  "You are an OCR and ingredient extraction assistant for skincare products. " +
  'Return strict JSON only in the shape {\\"ingredients\\": string[]}. ' +
  "Extract only the ingredient list text from the image and exclude marketing text.";

function getSessionUserId(headers) {
  if (!headers || typeof headers !== "object") return null;

  return headers["x-appwrite-user-id"] || headers["X-Appwrite-User-Id"] || null;
}

function parseBody(body) {
  if (typeof body === "string" && body.length > 0) {
    return JSON.parse(body);
  }

  if (body && typeof body === "object") {
    return body;
  }

  return {};
}

function sanitizeIngredients(ingredients) {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  const deduped = [];
  const seen = new Set();

  for (const item of ingredients) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = item.replace(/\s+/g, " ").trim();
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(normalized);
  }

  return deduped;
}

function parseJsonSafe(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function mapGeminiError(statusCode, fallbackMessage) {
  if (statusCode === 429) {
    return {
      errorCode: "QUOTA_EXCEEDED",
      error: "Gemini quota or rate limit exceeded.",
    };
  }

  if (statusCode === 408) {
    return {
      errorCode: "TIMEOUT",
      error: "Gemini request timed out.",
    };
  }

  if (statusCode >= 500) {
    return {
      errorCode: "GEMINI_UNAVAILABLE",
      error: "Gemini service is temporarily unavailable.",
    };
  }

  return {
    errorCode: "INVALID_REQUEST",
    error: fallbackMessage || "Gemini request failed.",
  };
}

function extractJsonObject(text) {
  if (typeof text !== "string") {
    return null;
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return text.slice(start, end + 1);
}

function getIngredientsFromGeminiText(text) {
  const direct = parseJsonSafe(text);
  if (direct && Array.isArray(direct.ingredients)) {
    return sanitizeIngredients(direct.ingredients);
  }

  const extractedJson = extractJsonObject(text);
  if (!extractedJson) {
    return [];
  }

  const parsed = parseJsonSafe(extractedJson);
  if (!parsed || !Array.isArray(parsed.ingredients)) {
    return [];
  }

  return sanitizeIngredients(parsed.ingredients);
}

export default async ({ req, res, error }) => {
  try {
    const sessionUserId = getSessionUserId(req.headers);

    if (!sessionUserId) {
      return res.json(
        { ok: false, errorCode: "UNAUTHORIZED", error: "Unauthorized" },
        401,
      );
    }

    let payload;
    try {
      payload = parseBody(req.body);
    } catch {
      return res.json(
        {
          ok: false,
          errorCode: "INVALID_PAYLOAD",
          error: "Request body must be valid JSON.",
        },
        400,
      );
    }

    const imageBase64 = payload?.imageBase64;
    const mimeType = payload?.mimeType || "image/jpeg";
    const selectedCategory = payload?.selectedCategory || null;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.json(
        {
          ok: false,
          errorCode: "INVALID_IMAGE",
          error: "imageBase64 is required.",
        },
        400,
      );
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return res.json(
        {
          ok: false,
          errorCode: "INVALID_MIME_TYPE",
          error: "Unsupported mimeType.",
        },
        400,
      );
    }

    const maxImageBytes = Number(
      process.env.INGREDIENT_MAX_IMAGE_BYTES || DEFAULT_MAX_IMAGE_BYTES,
    );
    const imageBytes = Buffer.byteLength(imageBase64, "base64");

    if (!Number.isFinite(imageBytes) || imageBytes <= 0) {
      return res.json(
        {
          ok: false,
          errorCode: "INVALID_IMAGE",
          error: "Image data is invalid.",
        },
        400,
      );
    }

    if (imageBytes > maxImageBytes) {
      return res.json(
        {
          ok: false,
          errorCode: "IMAGE_TOO_LARGE",
          error: "Image is too large for extraction.",
        },
        413,
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const systemPrompt =
      process.env.GEMINI_SYSTEM_PROMPT || FALLBACK_SYSTEM_PROMPT;

    if (!geminiApiKey) {
      return res.json(
        {
          ok: false,
          errorCode: "SERVER_MISCONFIGURED",
          error: "GEMINI_API_KEY is missing in function environment.",
        },
        500,
      );
    }

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(geminiModel) +
      ":generateContent?key=" +
      encodeURIComponent(geminiApiKey);

    const requestBody = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
            {
              text:
                "Extract only the ingredient list from this skincare label image. " +
                'If ingredients are not visible return {\\"ingredients\\":[]}. ' +
                "Return strict JSON only.",
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    const timeoutMs = Number(
      process.env.GEMINI_REQUEST_TIMEOUT_MS || DEFAULT_TIMEOUT_MS,
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let geminiResponse;
    try {
      geminiResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const rawResponse = await geminiResponse.text();
    const parsedRawResponse = parseJsonSafe(rawResponse);

    if (!geminiResponse.ok) {
      const mapped = mapGeminiError(
        geminiResponse.status,
        parsedRawResponse?.error?.message,
      );

      return res.json(
        {
          ok: false,
          errorCode: mapped.errorCode,
          error: mapped.error,
        },
        geminiResponse.status >= 400 ? geminiResponse.status : 500,
      );
    }

    const candidateText =
      parsedRawResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const ingredients = getIngredientsFromGeminiText(candidateText);

    if (ingredients.length === 0) {
      return res.json(
        {
          ok: false,
          errorCode: "NO_INGREDIENTS_FOUND",
          error: "No ingredients detected. Try a clearer image.",
          ingredients: [],
        },
        422,
      );
    }

    return res.json(
      {
        ok: true,
        ingredients,
        selectedCategory,
        meta: {
          model: geminiModel,
        },
      },
      200,
    );
  } catch (err) {
    if (err?.name === "AbortError") {
      return res.json(
        {
          ok: false,
          errorCode: "TIMEOUT",
          error: "Request timed out.",
        },
        408,
      );
    }

    error(`Ingredient extraction function failed: ${err?.message || err}`);
    return res.json(
      {
        ok: false,
        errorCode: "INTERNAL_ERROR",
        error: "Ingredient extraction failed.",
      },
      500,
    );
  }
};
