import { createHash } from "node:crypto";

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_RETRY_ATTEMPTS = 2;
const DEFAULT_RETRY_BASE_DELAY_MS = 500;

const ENV = {
  APPWRITE_FUNCTION_API_ENDPOINT: process.env.APPWRITE_FUNCTION_API_ENDPOINT,
  APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
  APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
  ANALYSIS_DATABASE_ID: process.env.ANALYSIS_DATABASE_ID,
  ANALYSIS_REQUESTS_TABLE_ID: process.env.ANALYSIS_REQUESTS_TABLE_ID,
  ANALYSIS_CACHE_TABLE_ID: process.env.ANALYSIS_CACHE_TABLE_ID,
  ANALYSIS_EVENTS_TABLE_ID: process.env.ANALYSIS_EVENTS_TABLE_ID,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  ANALYSIS_MODEL: process.env.ANALYSIS_MODEL,
  ANALYSIS_MODEL_VERSION: process.env.ANALYSIS_MODEL_VERSION,
  ANALYSIS_PROMPT_VERSION: process.env.ANALYSIS_PROMPT_VERSION,
  ANALYSIS_SYSTEM_PROMPT: process.env.ANALYSIS_SYSTEM_PROMPT,
  ANALYSIS_REQUEST_TIMEOUT_MS: process.env.ANALYSIS_REQUEST_TIMEOUT_MS,
  ANALYSIS_RETRY_ATTEMPTS: process.env.ANALYSIS_RETRY_ATTEMPTS,
  ANALYSIS_RETRY_BASE_DELAY_MS: process.env.ANALYSIS_RETRY_BASE_DELAY_MS,
};

const STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

function getEnv(name, fallback = "") {
  const value = ENV[name];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function nowIso() {
  return new Date().toISOString();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getSessionUserId(headers) {
  if (!headers || typeof headers !== "object") {
    return null;
  }

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

function normalizeIngredient(value) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeIngredients(ingredients) {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  const result = [];
  const seen = new Set();

  for (const ingredient of ingredients) {
    if (typeof ingredient !== "string") {
      continue;
    }

    const normalized = normalizeIngredient(ingredient);
    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
}

function normalizeCategory(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function parseJsonSafe(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function stableSortObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map((item) => stableSortObjectKeys(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const keys = Object.keys(value).sort();
  const next = {};

  for (const key of keys) {
    next[key] = stableSortObjectKeys(value[key]);
  }

  return next;
}

function stableStringify(value) {
  return JSON.stringify(stableSortObjectKeys(value));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function buildKeys({
  normalizedProfile,
  normalizedIngredients,
  normalizedCategory,
}) {
  const profileJson = stableStringify(normalizedProfile);
  const ingredientsJson = JSON.stringify(normalizedIngredients);

  const profileKey = sha256(profileJson);
  const ingredientsKey = sha256(ingredientsJson);
  const compositeKey = sha256(
    `${profileKey}|${ingredientsKey}|${normalizedCategory.toLowerCase()}`,
  );

  return {
    profileJson,
    ingredientsJson,
    profileKey,
    ingredientsKey,
    compositeKey,
  };
}

function buildQueryString(queries) {
  const params = new URLSearchParams();

  for (const query of queries) {
    params.append("queries[]", query);
  }

  const text = params.toString();
  return text ? `?${text}` : "";
}

function encodeTablePath(value) {
  return encodeURIComponent(value);
}

function mapRowsList(payload) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload.rows)) {
    return payload.rows;
  }

  if (Array.isArray(payload.documents)) {
    return payload.documents;
  }

  return [];
}

function mapRowId(row) {
  if (!row || typeof row !== "object") {
    return "";
  }

  return row.$id || row.id || "";
}

async function appwriteRequest({
  endpoint,
  projectId,
  apiKey,
  method,
  path,
  body,
}) {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const parsed = text ? parseJsonSafe(text) : null;

  if (!response.ok) {
    const errorMessage =
      (parsed && (parsed.message || parsed.error || parsed.type)) ||
      `Appwrite request failed (${response.status}).`;

    const err = new Error(errorMessage);
    err.statusCode = response.status;
    err.payload = parsed;
    err.path = path;
    err.method = method;
    throw err;
  }

  return parsed;
}

async function getDatabase({ endpoint, projectId, apiKey, databaseId }) {
  return appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "GET",
    path: `/databases/${encodeTablePath(databaseId)}`,
  });
}

async function getTable({ endpoint, projectId, apiKey, databaseId, tableId }) {
  return appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "GET",
    path: `/databases/${encodeTablePath(databaseId)}/tables/${encodeTablePath(tableId)}`,
  });
}

function createConfigError(code, message, details) {
  const err = new Error(message);
  err.errorCode = code;
  err.isConfigError = true;
  err.details = details || null;
  return err;
}

async function verifyAnalysisResources({
  endpoint,
  projectId,
  apiKey,
  databaseId,
  requestsTableId,
  cacheTableId,
  eventsTableId,
}) {
  try {
    await getDatabase({ endpoint, projectId, apiKey, databaseId });
  } catch (err) {
    if (err?.statusCode === 404) {
      throw createConfigError(
        "CONFIG_DATABASE_NOT_FOUND",
        "Configured analysis database was not found.",
        { databaseId },
      );
    }

    throw createConfigError(
      "CONFIG_DATABASE_UNREACHABLE",
      "Failed to verify analysis database configuration.",
      { databaseId, reason: err?.message || "Unknown error" },
    );
  }

  const tables = [
    { key: "ANALYSIS_REQUESTS_TABLE_ID", id: requestsTableId },
    { key: "ANALYSIS_CACHE_TABLE_ID", id: cacheTableId },
    { key: "ANALYSIS_EVENTS_TABLE_ID", id: eventsTableId },
  ];

  for (const table of tables) {
    try {
      await getTable({
        endpoint,
        projectId,
        apiKey,
        databaseId,
        tableId: table.id,
      });
    } catch (err) {
      if (err?.statusCode === 404) {
        throw createConfigError(
          "CONFIG_TABLE_NOT_FOUND",
          `Configured table was not found: ${table.key}.`,
          {
            databaseId,
            tableEnvKey: table.key,
            tableId: table.id,
          },
        );
      }

      throw createConfigError(
        "CONFIG_TABLE_UNREACHABLE",
        `Failed to verify configured table: ${table.key}.`,
        {
          databaseId,
          tableEnvKey: table.key,
          tableId: table.id,
          reason: err?.message || "Unknown error",
        },
      );
    }
  }
}

async function getUserProfile({ endpoint, projectId, apiKey, userId }) {
  const payload = await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "GET",
    path: `/users/${encodeURIComponent(userId)}`,
  });

  const prefs = payload?.prefs || {};

  if (
    typeof prefs.clinicalProfile === "string" &&
    prefs.clinicalProfile.trim()
  ) {
    const parsed = parseJsonSafe(prefs.clinicalProfile);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  }

  return {
    age: prefs.age || null,
    gender: prefs.gender || null,
    location: prefs.location || null,
    skinFeel: prefs.skinFeel || null,
    sensitivity: prefs.sensitivity || null,
    breakouts: prefs.breakouts || null,
    sunReaction: prefs.sunReaction || null,
    activeIngredients: prefs.activeIngredients || null,
    primaryGoal: prefs.primaryGoal || null,
    skinTone: prefs.skinTone || null,
  };
}

async function listRows({
  endpoint,
  projectId,
  apiKey,
  databaseId,
  tableId,
  queries,
}) {
  const path =
    `/databases/${encodeTablePath(databaseId)}/tables/${encodeTablePath(tableId)}/rows` +
    buildQueryString(queries || []);

  const payload = await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "GET",
    path,
  });

  return mapRowsList(payload);
}

async function getRow({
  endpoint,
  projectId,
  apiKey,
  databaseId,
  tableId,
  rowId,
}) {
  return appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "GET",
    path: `/databases/${encodeTablePath(databaseId)}/tables/${encodeTablePath(tableId)}/rows/${encodeURIComponent(rowId)}`,
  });
}

async function createRow({
  endpoint,
  projectId,
  apiKey,
  databaseId,
  tableId,
  data,
  rowId = "unique()",
}) {
  return appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    path: `/databases/${encodeTablePath(databaseId)}/tables/${encodeTablePath(tableId)}/rows`,
    body: {
      rowId,
      data,
    },
  });
}

async function updateRow({
  endpoint,
  projectId,
  apiKey,
  databaseId,
  tableId,
  rowId,
  data,
}) {
  return appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "PATCH",
    path: `/databases/${encodeTablePath(databaseId)}/tables/${encodeTablePath(tableId)}/rows/${encodeURIComponent(rowId)}`,
    body: {
      data,
    },
  });
}

function extractCandidateText(rawResponse) {
  const parsed = parseJsonSafe(rawResponse);
  if (!parsed) {
    return "";
  }

  return parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
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

function validateAnalysisPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, reason: "Payload is not an object." };
  }

  const analysis = payload.analysis;
  if (!analysis || typeof analysis !== "object") {
    return { ok: false, reason: "Missing analysis section." };
  }

  const validStates = new Set(["safe", "neutral", "bad"]);
  if (!validStates.has(analysis.state)) {
    return { ok: false, reason: "analysis.state is invalid." };
  }

  if (typeof analysis.score !== "number") {
    return { ok: false, reason: "analysis.score must be a number." };
  }

  if (!Array.isArray(payload.ingredients)) {
    return { ok: false, reason: "ingredients must be an array." };
  }

  if (!Array.isArray(payload.recommendations)) {
    return { ok: false, reason: "recommendations must be an array." };
  }

  const tones = new Set(["good", "neutral", "bad"]);
  for (const item of payload.ingredients) {
    if (!item || typeof item !== "object") {
      return { ok: false, reason: "ingredients items must be objects." };
    }

    if (typeof item.id !== "string" || typeof item.name !== "string") {
      return {
        ok: false,
        reason: "ingredients item must include id and name strings.",
      };
    }

    if (!tones.has(item.tone)) {
      return { ok: false, reason: "ingredients item tone is invalid." };
    }
  }

  const normalized = {
    ...payload,
    analysis: {
      ...analysis,
      score: Math.max(0, Math.min(100, Number(analysis.score))),
      confidence:
        typeof analysis.confidence === "number"
          ? Math.max(0, Math.min(1, analysis.confidence))
          : 0.5,
    },
  };

  if (
    typeof normalized.productMatches === "undefined" ||
    normalized.productMatches === null ||
    (Array.isArray(normalized.productMatches) &&
      normalized.productMatches.length === 0)
  ) {
    normalized.productMatches = "No recommendation found";
  }

  return { ok: true, payload: normalized };
}

function buildGeminiBody({
  systemPrompt,
  selectedCategory,
  normalizedIngredients,
  normalizedProfile,
}) {
  const requestPayload = {
    selectedCategory,
    ingredients: normalizedIngredients,
    userProfile: normalizedProfile,
  };

  return {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              "Run the skincare analysis for this exact request. Return strict JSON only.\\n" +
              JSON.stringify(requestPayload),
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  };
}

function isRetryableGeminiStatus(statusCode) {
  return statusCode === 408 || statusCode === 429 || statusCode >= 500;
}

async function fetchGeminiWithRetry({
  endpoint,
  requestBody,
  timeoutMs,
  maxAttempts,
  baseDelayMs,
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (
        !response.ok &&
        isRetryableGeminiStatus(response.status) &&
        attempt < maxAttempts
      ) {
        await response.text().catch(() => null);
        await sleep(baseDelayMs * 2 ** (attempt - 1));
        continue;
      }

      return response;
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) {
        throw err;
      }

      await sleep(baseDelayMs * 2 ** (attempt - 1));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Gemini request failed.");
}

async function writeEvent({
  endpoint,
  projectId,
  apiKey,
  databaseId,
  eventsTableId,
  requestId,
  eventType,
  message,
  metadata,
}) {
  if (!eventsTableId) {
    return;
  }

  try {
    await createRow({
      endpoint,
      projectId,
      apiKey,
      databaseId,
      tableId: eventsTableId,
      data: {
        requestId,
        eventType,
        message,
        metadataJson: metadata ? stableStringify(metadata) : null,
      },
    });
  } catch {
    // Non-blocking telemetry path.
  }
}

async function fetchCacheByCompositeKey({
  endpoint,
  projectId,
  apiKey,
  databaseId,
  cacheTableId,
  compositeKey,
  modelVersion,
  promptVersion,
}) {
  const rows = await listRows({
    endpoint,
    projectId,
    apiKey,
    databaseId,
    tableId: cacheTableId,
    queries: [
      `equal(\"compositeKey\", [\"${compositeKey}\"])`,
      `equal(\"modelVersion\", [\"${modelVersion}\"])`,
      `equal(\"promptVersion\", [\"${promptVersion}\"])`,
      "limit(1)",
    ],
  });

  return rows[0] || null;
}

async function saveCacheRow({
  endpoint,
  projectId,
  apiKey,
  databaseId,
  cacheTableId,
  payload,
}) {
  try {
    return await createRow({
      endpoint,
      projectId,
      apiKey,
      databaseId,
      tableId: cacheTableId,
      data: payload,
    });
  } catch (err) {
    if (err?.statusCode === 409) {
      return null;
    }

    throw err;
  }
}

async function buildAnalysisFromGemini({
  geminiApiKey,
  modelName,
  systemPrompt,
  selectedCategory,
  normalizedIngredients,
  normalizedProfile,
}) {
  const timeoutMs = toPositiveInt(
    getEnv("ANALYSIS_REQUEST_TIMEOUT_MS"),
    DEFAULT_TIMEOUT_MS,
  );
  const maxAttempts = toPositiveInt(
    getEnv("ANALYSIS_RETRY_ATTEMPTS"),
    DEFAULT_RETRY_ATTEMPTS,
  );
  const baseDelayMs = toPositiveInt(
    getEnv("ANALYSIS_RETRY_BASE_DELAY_MS"),
    DEFAULT_RETRY_BASE_DELAY_MS,
  );

  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(modelName) +
    ":generateContent?key=" +
    encodeURIComponent(geminiApiKey);

  const requestBody = buildGeminiBody({
    systemPrompt,
    selectedCategory,
    normalizedIngredients,
    normalizedProfile,
  });

  const response = await fetchGeminiWithRetry({
    endpoint,
    requestBody,
    timeoutMs,
    maxAttempts,
    baseDelayMs,
  });

  const raw = await response.text();
  if (!response.ok) {
    const parsed = parseJsonSafe(raw);
    const detail = parsed?.error?.message || "Analysis model request failed.";
    const err = new Error(detail);
    err.statusCode = response.status;
    throw err;
  }

  const candidateText = extractCandidateText(raw);
  const directJson = parseJsonSafe(candidateText);

  let parsed = directJson;
  if (!parsed) {
    const rawJsonObject = extractJsonObject(candidateText);
    parsed = rawJsonObject ? parseJsonSafe(rawJsonObject) : null;
  }

  const validated = validateAnalysisPayload(parsed);
  if (!validated.ok) {
    throw new Error(`Invalid analysis JSON: ${validated.reason}`);
  }

  return validated.payload;
}

function parseResultJson(resultJson) {
  if (typeof resultJson !== "string") {
    return null;
  }

  return parseJsonSafe(resultJson);
}

async function handleStart({
  payload,
  sessionUserId,
  config,
  endpoint,
  projectId,
  apiKey,
  log,
}) {
  log("=== HANDLE START ===");
  log(`Input selectedCategory: ${payload.selectedCategory}`);
  log(`Input ingredients: ${JSON.stringify(payload.ingredients)}`);

  const selectedCategory = normalizeCategory(payload.selectedCategory);
  const normalizedIngredients = normalizeIngredients(payload.ingredients);

  log(`Normalized selectedCategory: ${selectedCategory}`);
  log(`Normalized ingredients: ${JSON.stringify(normalizedIngredients)}`);

  if (!selectedCategory) {
    log("ERROR: selectedCategory is empty after normalization");
    return {
      statusCode: 400,
      body: {
        ok: false,
        errorCode: "INVALID_CATEGORY",
        error: "selectedCategory is required.",
      },
    };
  }

  if (normalizedIngredients.length < 3) {
    log(
      `ERROR: Only ${normalizedIngredients.length} ingredients, need at least 3`,
    );
    return {
      statusCode: 400,
      body: {
        ok: false,
        errorCode: "INSUFFICIENT_INGREDIENTS",
        error: "At least 3 ingredients are required.",
      },
    };
  }

  let normalizedProfile;
  try {
    log("Fetching user profile...");
    normalizedProfile = await getUserProfile({
      endpoint,
      projectId,
      apiKey,
      userId: sessionUserId,
    });
    log(`User profile fetched: ${JSON.stringify(normalizedProfile)}`);
  } catch (err) {
    log(
      `Falling back to request profile because user profile fetch failed: ${err?.message || err}`,
    );
    normalizedProfile =
      payload.userProfile && typeof payload.userProfile === "object"
        ? payload.userProfile
        : {};
    log(`Using fallback profile: ${JSON.stringify(normalizedProfile)}`);
  }

  log("Building cache keys...");
  const keys = buildKeys({
    normalizedProfile,
    normalizedIngredients,
    normalizedCategory: selectedCategory,
  });
  log(`Composite key: ${keys.compositeKey}`);

  log("Checking cache...");
  let cacheRow = null;
  try {
    const cachePromise = fetchCacheByCompositeKey({
      endpoint,
      projectId,
      apiKey,
      databaseId: config.databaseId,
      cacheTableId: config.cacheTableId,
      compositeKey: keys.compositeKey,
      modelVersion: config.modelVersion,
      promptVersion: config.promptVersion,
    });

    // 5 second timeout for cache lookup
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Cache lookup timeout")), 5000),
    );

    cacheRow = await Promise.race([cachePromise, timeoutPromise]);
    log(
      `Cache fetch completed. Cache row: ${cacheRow ? "FOUND" : "NOT FOUND"}`,
    );
  } catch (err) {
    log(`WARNING: Cache lookup failed or timed out: ${err?.message || err}`);
    log(`Proceeding without cache...`);
    cacheRow = null;
  }

  if (cacheRow) {
    log("Cache hit detected, returning cached result...");
    const cacheRowId = mapRowId(cacheRow);
    const currentUsage = Number(cacheRow.usageCount || 0);
    log(`Cache row ID: ${cacheRowId}`);

    if (cacheRowId) {
      try {
        await updateRow({
          endpoint,
          projectId,
          apiKey,
          databaseId: config.databaseId,
          tableId: config.cacheTableId,
          rowId: cacheRowId,
          data: {
            usageCount: currentUsage + 1,
            lastUsedAt: nowIso(),
          },
        });
        log("Cache usage count updated");
      } catch (err) {
        log(
          `Warning: Failed to update cache usage count: ${err?.message || err}`,
        );
      }
    }

    try {
      const createdRequest = await createRow({
        endpoint,
        projectId,
        apiKey,
        databaseId: config.databaseId,
        tableId: config.requestsTableId,
        data: {
          userId: sessionUserId,
          status: STATUS.COMPLETED,
          profileKey: keys.profileKey,
          ingredientsKey: keys.ingredientsKey,
          compositeKey: keys.compositeKey,
          selectedCategory,
          ingredientsRawJson: keys.ingredientsJson,
          profileRawJson: keys.profileJson,
          resultJson: cacheRow.resultJson,
          cacheHit: true,
          errorCode: null,
          errorMessage: null,
          modelVersion: config.modelVersion,
          promptVersion: config.promptVersion,
          processingStartedAt: nowIso(),
          completedAt: nowIso(),
        },
      });
      log(`Cache hit request created: ${mapRowId(createdRequest)}`);

      return {
        statusCode: 200,
        body: {
          ok: true,
          status: "completed",
          analysisRequestId: mapRowId(createdRequest),
          cacheHit: true,
          result: parseResultJson(cacheRow.resultJson),
        },
      };
    } catch (err) {
      log(`ERROR creating cache hit request: ${err?.message || err}`);
      throw err;
    }
  }

  log("No cache hit, creating new request...");
  let requestRow;
  try {
    requestRow = await createRow({
      endpoint,
      projectId,
      apiKey,
      databaseId: config.databaseId,
      tableId: config.requestsTableId,
      data: {
        userId: sessionUserId,
        status: STATUS.PROCESSING,
        profileKey: keys.profileKey,
        ingredientsKey: keys.ingredientsKey,
        compositeKey: keys.compositeKey,
        selectedCategory,
        ingredientsRawJson: keys.ingredientsJson,
        profileRawJson: keys.profileJson,
        resultJson: null,
        cacheHit: false,
        errorCode: null,
        errorMessage: null,
        modelVersion: config.modelVersion,
        promptVersion: config.promptVersion,
        processingStartedAt: nowIso(),
        completedAt: null,
      },
    });
    log(`Request row created: ${JSON.stringify(requestRow)}`);
  } catch (err) {
    log(`ERROR creating request row: ${err?.message || err}`);
    throw err;
  }

  const requestId = mapRowId(requestRow);
  log(`Request ID: ${requestId}`);

  await writeEvent({
    endpoint,
    projectId,
    apiKey,
    databaseId: config.databaseId,
    eventsTableId: config.eventsTableId,
    requestId,
    eventType: "REQUEST_PROCESSING_STARTED",
    message: "Analysis request started.",
  });

  try {
    const analysisResult = await buildAnalysisFromGemini({
      geminiApiKey: config.geminiApiKey,
      modelName: config.modelName,
      systemPrompt: config.systemPrompt,
      selectedCategory,
      normalizedIngredients,
      normalizedProfile,
    });

    const resultJson = JSON.stringify(analysisResult);

    await saveCacheRow({
      endpoint,
      projectId,
      apiKey,
      databaseId: config.databaseId,
      cacheTableId: config.cacheTableId,
      payload: {
        compositeKey: keys.compositeKey,
        profileKey: keys.profileKey,
        ingredientsKey: keys.ingredientsKey,
        selectedCategory,
        ingredientsNormalizedJson: keys.ingredientsJson,
        profileNormalizedJson: keys.profileJson,
        resultJson,
        modelProvider: "google",
        modelName: config.modelName,
        modelVersion: config.modelVersion,
        promptVersion: config.promptVersion,
        createdByUserId: sessionUserId,
        usageCount: 1,
        lastUsedAt: nowIso(),
      },
    });

    await updateRow({
      endpoint,
      projectId,
      apiKey,
      databaseId: config.databaseId,
      tableId: config.requestsTableId,
      rowId: requestId,
      data: {
        status: STATUS.COMPLETED,
        resultJson,
        cacheHit: false,
        errorCode: null,
        errorMessage: null,
        completedAt: nowIso(),
      },
    });

    await writeEvent({
      endpoint,
      projectId,
      apiKey,
      databaseId: config.databaseId,
      eventsTableId: config.eventsTableId,
      requestId,
      eventType: "PROCESSING_COMPLETED",
      message: "Analysis processing completed.",
    });

    return {
      statusCode: 200,
      body: {
        ok: true,
        status: "completed",
        analysisRequestId: requestId,
        cacheHit: false,
        result: analysisResult,
      },
    };
  } catch (err) {
    await updateRow({
      endpoint,
      projectId,
      apiKey,
      databaseId: config.databaseId,
      tableId: config.requestsTableId,
      rowId: requestId,
      data: {
        status: STATUS.FAILED,
        errorCode: "ANALYSIS_FAILED",
        errorMessage: err?.message || "Analysis failed.",
        completedAt: nowIso(),
      },
    });

    await writeEvent({
      endpoint,
      projectId,
      apiKey,
      databaseId: config.databaseId,
      eventsTableId: config.eventsTableId,
      requestId,
      eventType: "PROCESSING_FAILED",
      message: "Analysis processing failed.",
      metadata: {
        message: err?.message || "Analysis failed.",
      },
    });

    return {
      statusCode: 500,
      body: {
        ok: false,
        status: "failed",
        analysisRequestId: requestId,
        errorCode: "ANALYSIS_FAILED",
        error: err?.message || "Analysis failed.",
      },
    };
  }
}

async function handleStatus({
  payload,
  sessionUserId,
  config,
  endpoint,
  projectId,
  apiKey,
}) {
  const analysisRequestId =
    typeof payload.analysisRequestId === "string"
      ? payload.analysisRequestId.trim()
      : "";

  if (!analysisRequestId) {
    return {
      statusCode: 400,
      body: {
        ok: false,
        errorCode: "INVALID_REQUEST_ID",
        error: "analysisRequestId is required.",
      },
    };
  }

  const requestRow = await getRow({
    endpoint,
    projectId,
    apiKey,
    databaseId: config.databaseId,
    tableId: config.requestsTableId,
    rowId: analysisRequestId,
  });

  if (!requestRow || requestRow.userId !== sessionUserId) {
    return {
      statusCode: 404,
      body: {
        ok: false,
        errorCode: "REQUEST_NOT_FOUND",
        error: "Analysis request was not found.",
      },
    };
  }

  if (requestRow.status === STATUS.COMPLETED) {
    return {
      statusCode: 200,
      body: {
        ok: true,
        status: "completed",
        analysisRequestId,
        cacheHit: Boolean(requestRow.cacheHit),
        result: parseResultJson(requestRow.resultJson),
      },
    };
  }

  if (requestRow.status === STATUS.FAILED) {
    return {
      statusCode: 200,
      body: {
        ok: false,
        status: "failed",
        analysisRequestId,
        errorCode: requestRow.errorCode || "ANALYSIS_FAILED",
        error: requestRow.errorMessage || "Analysis failed.",
      },
    };
  }

  return {
    statusCode: 200,
    body: {
      ok: true,
      status: "processing",
      analysisRequestId,
    },
  };
}

export default async ({ req, res, log, error }) => {
  log("=== ANALYSIS FUNCTION START ===");
  log(`Method: ${req.method}`);
  log(`Path: ${req.path}`);
  log(`Headers: ${JSON.stringify(req.headers)}`);
  log(`Body type: ${typeof req.body}`);

  const endpoint = getEnv("APPWRITE_FUNCTION_API_ENDPOINT");
  const projectId = getEnv("APPWRITE_FUNCTION_PROJECT_ID");
  const apiKey = getEnv("APPWRITE_API_KEY");
  const databaseId = getEnv("ANALYSIS_DATABASE_ID");
  const requestsTableId = getEnv(
    "ANALYSIS_REQUESTS_TABLE_ID",
    "analysis_requests",
  );
  const cacheTableId = getEnv("ANALYSIS_CACHE_TABLE_ID", "analysis_cache");
  const eventsTableId = getEnv("ANALYSIS_EVENTS_TABLE_ID", "analysis_events");
  const geminiApiKey = getEnv("GEMINI_API_KEY");
  const modelName = getEnv("ANALYSIS_MODEL", DEFAULT_MODEL);
  const modelVersion = getEnv("ANALYSIS_MODEL_VERSION");
  const promptVersion = getEnv("ANALYSIS_PROMPT_VERSION");
  const systemPrompt = getEnv("ANALYSIS_SYSTEM_PROMPT");

  log(
    `Resolved analysis IDs: database=${databaseId || "<empty>"}, requests=${requestsTableId || "<empty>"}, cache=${cacheTableId || "<empty>"}, events=${eventsTableId || "<empty>"}`,
  );

  log(
    `ENV Check: endpoint=${!!endpoint}, projectId=${!!projectId}, apiKey=${!!apiKey}, databaseId=${!!databaseId}`,
  );

  if (
    !endpoint ||
    !projectId ||
    !apiKey ||
    !databaseId ||
    !requestsTableId ||
    !cacheTableId ||
    !eventsTableId
  ) {
    log("ERROR: Missing Appwrite environment variables");
    return res.json(
      {
        ok: false,
        errorCode: "SERVER_MISCONFIGURED",
        error:
          "Appwrite function environment is incomplete. Database and table IDs are required.",
      },
      500,
    );
  }

  log(
    `GEMINI Check: key=${!!geminiApiKey}, modelVer=${!!modelVersion}, promptVer=${!!promptVersion}`,
  );

  if (!geminiApiKey || !modelVersion || !promptVersion) {
    log("ERROR: Missing Gemini environment variables");
    return res.json(
      {
        ok: false,
        errorCode: "SERVER_MISCONFIGURED",
        error: "Analysis model environment is incomplete.",
      },
      500,
    );
  }

  if (!systemPrompt) {
    log("ERROR: Missing system prompt");
    return res.json(
      {
        ok: false,
        errorCode: "PROMPT_NOT_CONFIGURED",
        error: "ANALYSIS_SYSTEM_PROMPT is required for analysis execution.",
      },
      500,
    );
  }

  const sessionUserId = getSessionUserId(req.headers);
  log(`Session User ID: ${sessionUserId || "MISSING"}`);

  if (!sessionUserId) {
    log("ERROR: Unauthorized - no session user ID");
    return res.json(
      {
        ok: false,
        errorCode: "UNAUTHORIZED",
        error: "Unauthorized",
      },
      401,
    );
  }

  try {
    await verifyAnalysisResources({
      endpoint,
      projectId,
      apiKey,
      databaseId,
      requestsTableId,
      cacheTableId,
      eventsTableId,
    });
  } catch (err) {
    error(
      `Analysis config verification failed: ${err?.errorCode || "UNKNOWN"} ${err?.message || err}`,
    );
    return res.json(
      {
        ok: false,
        errorCode: err?.errorCode || "SERVER_MISCONFIGURED",
        error:
          err?.message || "Configured analysis database resources are invalid.",
        details: err?.details || null,
      },
      500,
    );
  }

  const config = {
    databaseId,
    requestsTableId,
    cacheTableId,
    eventsTableId,
    geminiApiKey,
    modelName,
    modelVersion,
    promptVersion,
    systemPrompt,
  };

  let payload;
  try {
    log(
      `Parsing body: ${typeof req.body === "string" ? req.body.substring(0, 100) : JSON.stringify(req.body).substring(0, 100)}`,
    );
    payload = parseBody(req.body);
    log(`Parsed payload: ${JSON.stringify(payload)}`);
  } catch (err) {
    log(`ERROR: Parse failed: ${err?.message || err}`);
    return res.json(
      {
        ok: false,
        errorCode: "INVALID_PAYLOAD",
        error: "Request body must be valid JSON.",
      },
      400,
    );
  }

  const action =
    typeof payload.action === "string"
      ? payload.action.trim().toLowerCase()
      : "start";

  log(`Action: ${action}`);

  try {
    if (action === "status") {
      log("Handling status action");
      const result = await handleStatus({
        payload,
        sessionUserId,
        config,
        endpoint,
        projectId,
        apiKey,
      });
      log(`Status result: ${JSON.stringify(result)}`);
      return res.json(result.body, result.statusCode);
    }

    if (action !== "start") {
      log(`ERROR: Invalid action '${action}'`);
      return res.json(
        {
          ok: false,
          errorCode: "INVALID_ACTION",
          error: "action must be start or status.",
        },
        400,
      );
    }

    log("Handling start action");
    const result = await handleStart({
      payload,
      sessionUserId,
      config,
      endpoint,
      projectId,
      apiKey,
      log,
    });
    log(`Start result: ${JSON.stringify(result)}`);
    return res.json(result.body, result.statusCode);
  } catch (err) {
    error(`Analysis engine function failed: ${err?.message || err}`);

    if (err?.statusCode === 404) {
      return res.json(
        {
          ok: false,
          errorCode: "CONFIG_RESOURCE_NOT_FOUND",
          error:
            "A configured analysis database resource was not found. Verify database and table IDs.",
        },
        500,
      );
    }

    return res.json(
      {
        ok: false,
        errorCode: "INTERNAL_ERROR",
        error: "Analysis engine failed.",
      },
      500,
    );
  }
};
