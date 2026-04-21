import {
  EncodingType,
  getInfoAsync,
  readAsStringAsync,
} from "expo-file-system/legacy";

import { functions } from "@/libs/appwrite";

const INGREDIENT_EXTRACTION_FUNCTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_INGREDIENT_EXTRACTION_FUNCTION_ID || "";
const MAX_CLIENT_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_EXTRACTION_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 700;

type ExtractIngredientsParams = {
  imageUri: string;
  selectedCategory?: string | null;
};

type IngredientExtractionSuccessResponse = {
  ok: true;
  ingredients: string[];
};

type IngredientExtractionErrorResponse = {
  ok: false;
  error?: string;
  errorCode?:
    | "UNAUTHORIZED"
    | "INVALID_PAYLOAD"
    | "INVALID_IMAGE"
    | "INVALID_MIME_TYPE"
    | "IMAGE_TOO_LARGE"
    | "SERVER_MISCONFIGURED"
    | "QUOTA_EXCEEDED"
    | "TIMEOUT"
    | "GEMINI_UNAVAILABLE"
    | "INVALID_REQUEST"
    | "NO_INGREDIENTS_FOUND"
    | "INTERNAL_ERROR"
    | string;
};

type IngredientExtractionResponse =
  | IngredientExtractionSuccessResponse
  | IngredientExtractionErrorResponse;

export type IngredientExtractionResult = {
  ingredients: string[];
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableFailure(
  executionStatus: string,
  responseStatusCode: number,
  errorCode?: string,
) {
  if (executionStatus !== "completed") {
    return true;
  }

  if (responseStatusCode === 408 || responseStatusCode >= 500) {
    return true;
  }

  return errorCode === "GEMINI_UNAVAILABLE" || errorCode === "TIMEOUT";
}

function getFriendlyExtractionErrorMessage(
  errorCode: string | undefined,
  fallback: string,
) {
  switch (errorCode) {
    case "NO_INGREDIENTS_FOUND":
      return "We could not detect ingredients in this photo. Retake with brighter light and include the full ingredient list.";
    case "IMAGE_TOO_LARGE":
      return "This photo is too large to process. Retake using a closer, clearer shot.";
    case "TIMEOUT":
      return "The scan took too long. Check your network and try again.";
    case "QUOTA_EXCEEDED":
      return "The AI service is busy right now. Please try again in a moment.";
    case "INVALID_IMAGE":
      return "The captured image could not be read. Please retake the photo.";
    case "UNAUTHORIZED":
      return "Your session expired. Please sign in again and retry.";
    case "GEMINI_UNAVAILABLE":
      return "The analysis service is temporarily unavailable. Please try again shortly.";
    default:
      return fallback;
  }
}

function inferMimeType(imageUri: string) {
  const normalizedUri = imageUri.split("?")[0].toLowerCase();

  if (normalizedUri.endsWith(".png")) {
    return "image/png";
  }

  if (normalizedUri.endsWith(".webp")) {
    return "image/webp";
  }

  if (normalizedUri.endsWith(".heic")) {
    return "image/heic";
  }

  if (normalizedUri.endsWith(".heif")) {
    return "image/heif";
  }

  return "image/jpeg";
}

function parseResponseBody(rawBody: string | undefined) {
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as IngredientExtractionResponse;
  } catch {
    return null;
  }
}

export async function extractIngredientsFromImage({
  imageUri,
  selectedCategory,
}: ExtractIngredientsParams): Promise<IngredientExtractionResult> {
  if (!INGREDIENT_EXTRACTION_FUNCTION_ID) {
    throw new Error(
      "Ingredient extraction function ID is not configured in app environment.",
    );
  }

  const imageInfo = await getInfoAsync(imageUri);
  if (
    imageInfo.exists &&
    typeof imageInfo.size === "number" &&
    imageInfo.size > MAX_CLIENT_IMAGE_BYTES
  ) {
    throw new Error(
      "This image is too large to process. Retake with a closer shot or use better lighting.",
    );
  }

  const imageBase64 = await readAsStringAsync(imageUri, {
    encoding: EncodingType.Base64,
  });

  if (!imageBase64) {
    throw new Error("Unable to read image for ingredient extraction.");
  }

  let lastErrorMessage = "Ingredient extraction failed.";

  for (let attempt = 1; attempt <= MAX_EXTRACTION_ATTEMPTS; attempt += 1) {
    const execution = await functions.createExecution({
      functionId: INGREDIENT_EXTRACTION_FUNCTION_ID,
      async: false,
      body: JSON.stringify({
        imageBase64,
        mimeType: inferMimeType(imageUri),
        selectedCategory: selectedCategory || null,
      }),
    });

    const parsedResponse = parseResponseBody(execution.responseBody);
    const responseStatusCode = execution.responseStatusCode ?? 500;

    if (
      execution.status === "completed" &&
      responseStatusCode < 400 &&
      parsedResponse?.ok
    ) {
      const ingredients = parsedResponse.ingredients
        .filter((ingredient) => typeof ingredient === "string")
        .map((ingredient) => ingredient.trim())
        .filter(Boolean);

      if (ingredients.length === 0) {
        throw new Error("No ingredients were extracted. Try a clearer image.");
      }

      return {
        ingredients,
      };
    }

    const fallbackError =
      execution.status !== "completed"
        ? "The analysis service is temporarily unavailable. Please try again shortly."
        : "Ingredient extraction failed.";

    lastErrorMessage =
      parsedResponse && !parsedResponse.ok && parsedResponse.error
        ? getFriendlyExtractionErrorMessage(
            parsedResponse.errorCode,
            parsedResponse.error,
          )
        : fallbackError;

    const shouldRetry = isRetryableFailure(
      execution.status,
      responseStatusCode,
      parsedResponse && !parsedResponse.ok
        ? parsedResponse.errorCode
        : undefined,
    );

    if (!shouldRetry || attempt === MAX_EXTRACTION_ATTEMPTS) {
      break;
    }

    const delayMs = RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
    await sleep(delayMs);
  }

  throw new Error(lastErrorMessage);
}
