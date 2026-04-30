import { functions } from "@/libs/appwrite";

const ANALYSIS_FUNCTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_ANALYSIS_FUNCTION_ID || "";
const MAX_POLL_ATTEMPTS = 14;
const POLL_INTERVAL_MS = 1800;

type AnalysisState = "safe" | "neutral" | "bad";
type IngredientTone = "good" | "neutral" | "bad";

export type AnalysisResultPayload = {
  analysis: {
    state: AnalysisState;
    score: number;
    badgeText: "Safe" | "Moderate" | "Not Safe";
    title: string;
    description: string;
    confidence: number;
  };
  ingredients: {
    id: string;
    name: string;
    chemicalEffect: string;
    benefitText: string;
    tone: IngredientTone;
  }[];
  recommendations: {
    id: string;
    productName: string;
    why: string;
    match: string;
  }[];
  productMatches:
    | "No recommendation found"
    | {
        name: string;
        brand: string;
        image: string;
        why: string;
        match: string;
      }[];
  personalizedAnalysis?: string;
};

type BaseResponse = {
  ok: boolean;
  status: "accepted" | "processing" | "completed" | "failed";
  analysisRequestId?: string;
  cacheHit?: boolean;
  error?: string;
  errorCode?: string;
};

type AnalysisCompletedResponse = BaseResponse & {
  status: "completed";
  ok: true;
  analysisRequestId: string;
  result: AnalysisResultPayload;
};

type AnalysisAcceptedResponse = BaseResponse & {
  status: "accepted";
  ok: true;
  analysisRequestId: string;
};

type AnalysisProcessingResponse = BaseResponse & {
  status: "processing";
  ok: true;
  analysisRequestId: string;
};

type AnalysisFailedResponse = BaseResponse & {
  status: "failed";
  ok: false;
  analysisRequestId?: string;
};

type AnalysisFunctionResponse =
  | AnalysisCompletedResponse
  | AnalysisAcceptedResponse
  | AnalysisProcessingResponse
  | AnalysisFailedResponse;

export type StartAnalysisParams = {
  selectedCategory: string;
  ingredients: string[];
};

const VALID_STATUSES = new Set([
  "accepted",
  "processing",
  "completed",
  "failed",
]);

function parseFunctionResponse(
  rawBody?: string,
): AnalysisFunctionResponse | null {
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody) as AnalysisFunctionResponse;
  } catch {
    return null;
  }
}

function getFriendlyError(errorCode: string | undefined, fallback: string) {
  switch (errorCode) {
    case "UNAUTHORIZED":
      return "Your session expired. Please sign in again and retry.";
    case "INVALID_CATEGORY":
      return "Product category is missing. Choose a category and try again.";
    case "INSUFFICIENT_INGREDIENTS":
      return "Please provide at least 3 ingredients for analysis.";
    case "PROMPT_NOT_CONFIGURED":
      return "Analysis configuration is incomplete. Please contact support.";
    case "ANALYSIS_FAILED":
      return "Analysis could not be completed right now. Please try again.";
    default:
      return fallback;
  }
}

async function executeAnalysis(body: Record<string, unknown>) {
  if (!ANALYSIS_FUNCTION_ID) {
    throw new Error(
      "Analysis function ID is not configured in app environment.",
    );
  }

  return functions.createExecution({
    functionId: ANALYSIS_FUNCTION_ID,
    async: false,
    body: JSON.stringify(body),
  });
}

export async function startAnalysis({
  selectedCategory,
  ingredients,
}: StartAnalysisParams): Promise<AnalysisFunctionResponse> {
  const execution = await executeAnalysis({
    action: "start",
    selectedCategory,
    ingredients,
  });

  const response = parseFunctionResponse(execution.responseBody);
  if (!response) {
    throw new Error("Analysis service returned an invalid response.");
  }

  if (!VALID_STATUSES.has(response.status)) {
    throw new Error(
      "Analysis response has an invalid status. Please redeploy the latest analysis function.",
    );
  }

  if (execution.status !== "completed" || execution.responseStatusCode >= 500) {
    throw new Error("Analysis service is temporarily unavailable.");
  }

  if (response.status === "failed") {
    const message = getFriendlyError(
      response.errorCode,
      response.error || "Analysis failed.",
    );
    throw new Error(message);
  }

  if (
    (response.status === "accepted" || response.status === "processing") &&
    !response.analysisRequestId
  ) {
    throw new Error(
      "Analysis response is missing analysisRequestId. Please redeploy the latest analysis function.",
    );
  }

  if (response.status === "completed" && response.ok && !response.result) {
    throw new Error(
      "Analysis completed response is missing result data. Please redeploy the latest analysis function.",
    );
  }

  return response;
}

export async function getAnalysisStatus(
  analysisRequestId: string,
): Promise<AnalysisFunctionResponse> {
  const execution = await executeAnalysis({
    action: "status",
    analysisRequestId,
  });

  const response = parseFunctionResponse(execution.responseBody);
  if (!response) {
    throw new Error("Analysis service returned an invalid status response.");
  }

  if (execution.status !== "completed" || execution.responseStatusCode >= 500) {
    throw new Error("Analysis status request failed. Please try again.");
  }

  if (response.status === "failed") {
    const message = getFriendlyError(
      response.errorCode,
      response.error || "Analysis failed.",
    );
    throw new Error(message);
  }

  return response;
}

export async function pollAnalysisUntilComplete(
  analysisRequestId: string,
): Promise<AnalysisCompletedResponse> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    const response = await getAnalysisStatus(analysisRequestId);

    if (response.status === "completed" && response.ok) {
      return response;
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, POLL_INTERVAL_MS);
    });
  }

  throw new Error("Analysis timed out. Please try again.");
}
