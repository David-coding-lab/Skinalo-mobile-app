import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { ProductCategory } from "@/types/productCategory";

type IngredientMutationResult = {
  ok: boolean;
  reason?: "EMPTY" | "DUPLICATE" | "OUT_OF_RANGE";
};

function normalizeIngredient(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeIngredientList(ingredients: string[]) {
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const ingredient of ingredients) {
    const normalized = normalizeIngredient(ingredient);

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

type ScanContextValue = {
  selectedCategory: ProductCategory | null;
  setSelectedCategory: (category: ProductCategory | null) => void;
  capturedImageUri: string | null;
  setCapturedImageUri: (uri: string | null) => void;
  extractedIngredients: string[];
  setExtractedIngredients: (ingredients: string[]) => void;
  addIngredient: (ingredient: string) => IngredientMutationResult;
  updateIngredient: (
    index: number,
    ingredient: string,
  ) => IngredientMutationResult;
  removeIngredient: (index: number) => IngredientMutationResult;
  clearExtractedIngredients: () => void;
  extractionError: string | null;
  setExtractionError: (error: string | null) => void;
  clearCapturedImage: () => void;
  clearScanSession: () => void;
};

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

type ScanProviderProps = {
  children: ReactNode;
};

export function ScanProvider({ children }: ScanProviderProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);
  const [capturedImageUri, setCapturedImageUriState] = useState<string | null>(
    null,
  );
  const [extractedIngredients, setExtractedIngredientsState] = useState<
    string[]
  >([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const setCapturedImageUri = useCallback((uri: string | null) => {
    setCapturedImageUriState(uri);

    if (uri) {
      setExtractedIngredientsState([]);
      setExtractionError(null);
    }
  }, []);

  const setExtractedIngredients = useCallback((ingredients: string[]) => {
    setExtractedIngredientsState(sanitizeIngredientList(ingredients));
  }, []);

  const addIngredient = useCallback(
    (ingredient: string): IngredientMutationResult => {
      const normalized = normalizeIngredient(ingredient);

      if (!normalized) {
        return { ok: false, reason: "EMPTY" };
      }

      let didAdd = false;

      setExtractedIngredientsState((previous) => {
        const exists = previous.some(
          (item) =>
            normalizeIngredient(item).toLowerCase() ===
            normalized.toLowerCase(),
        );

        if (exists) {
          return previous;
        }

        didAdd = true;
        return [...previous, normalized];
      });

      if (!didAdd) {
        return { ok: false, reason: "DUPLICATE" };
      }

      return { ok: true };
    },
    [],
  );

  const updateIngredient = useCallback(
    (index: number, ingredient: string): IngredientMutationResult => {
      const normalized = normalizeIngredient(ingredient);

      if (!normalized) {
        return { ok: false, reason: "EMPTY" };
      }

      let nextResult: IngredientMutationResult = { ok: true };

      setExtractedIngredientsState((previous) => {
        if (index < 0 || index >= previous.length) {
          nextResult = { ok: false, reason: "OUT_OF_RANGE" };
          return previous;
        }

        const hasDuplicate = previous.some((item, itemIndex) => {
          if (itemIndex === index) {
            return false;
          }

          return (
            normalizeIngredient(item).toLowerCase() === normalized.toLowerCase()
          );
        });

        if (hasDuplicate) {
          nextResult = { ok: false, reason: "DUPLICATE" };
          return previous;
        }

        const nextIngredients = [...previous];
        nextIngredients[index] = normalized;
        return nextIngredients;
      });

      return nextResult;
    },
    [],
  );

  const removeIngredient = useCallback(
    (index: number): IngredientMutationResult => {
      let didRemove = false;

      setExtractedIngredientsState((previous) => {
        if (index < 0 || index >= previous.length) {
          return previous;
        }

        didRemove = true;
        return previous.filter((_, itemIndex) => itemIndex !== index);
      });

      if (!didRemove) {
        return { ok: false, reason: "OUT_OF_RANGE" };
      }

      return { ok: true };
    },
    [],
  );

  const clearExtractedIngredients = useCallback(() => {
    setExtractedIngredientsState([]);
  }, []);

  const clearCapturedImage = useCallback(() => {
    setCapturedImageUriState(null);
    setExtractedIngredientsState([]);
    setExtractionError(null);
  }, []);

  const clearScanSession = useCallback(() => {
    setSelectedCategory(null);
    clearCapturedImage();
  }, [clearCapturedImage]);

  const value = useMemo(
    () => ({
      selectedCategory,
      setSelectedCategory,
      capturedImageUri,
      setCapturedImageUri,
      extractedIngredients,
      setExtractedIngredients,
      addIngredient,
      updateIngredient,
      removeIngredient,
      clearExtractedIngredients,
      extractionError,
      setExtractionError,
      clearCapturedImage,
      clearScanSession,
    }),
    [
      addIngredient,
      capturedImageUri,
      clearCapturedImage,
      clearExtractedIngredients,
      clearScanSession,
      extractedIngredients,
      extractionError,
      removeIngredient,
      selectedCategory,
      setCapturedImageUri,
      setExtractedIngredients,
      updateIngredient,
    ],
  );

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const context = useContext(ScanContext);

  if (!context) {
    throw new Error("useScan must be used within ScanProvider");
  }

  return context;
}
