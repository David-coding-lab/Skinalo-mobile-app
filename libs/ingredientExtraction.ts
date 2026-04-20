import { EncodingType, readAsStringAsync } from "expo-file-system/legacy";

import { functions } from "@/libs/appwrite";

const INGREDIENT_EXTRACTION_FUNCTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_INGREDIENT_EXTRACTION_FUNCTION_ID || "";

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
  errorCode?: string;
};

type IngredientExtractionResponse =
  | IngredientExtractionSuccessResponse
  | IngredientExtractionErrorResponse;

export type IngredientExtractionResult = {
  ingredients: string[];
};

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

  const imageBase64 = await readAsStringAsync(imageUri, {
    encoding: EncodingType.Base64,
  });

  if (!imageBase64) {
    throw new Error("Unable to read image for ingredient extraction.");
  }

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
    execution.status !== "completed" ||
    responseStatusCode >= 400 ||
    !parsedResponse?.ok
  ) {
    const fallbackError =
      execution.status !== "completed"
        ? "Ingredient extraction did not complete."
        : "Ingredient extraction failed.";

    const errorMessage =
      parsedResponse && !parsedResponse.ok && parsedResponse.error
        ? parsedResponse.error
        : fallbackError;

    throw new Error(errorMessage);
  }

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
