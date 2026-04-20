import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { ProductCategory } from "@/types/productCategory";

type ScanContextValue = {
  selectedCategory: ProductCategory | null;
  setSelectedCategory: (category: ProductCategory | null) => void;
  capturedImageUri: string | null;
  setCapturedImageUri: (uri: string | null) => void;
  extractedIngredients: string[];
  setExtractedIngredients: (ingredients: string[]) => void;
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
    setExtractedIngredientsState(ingredients);
  }, []);

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
      clearExtractedIngredients,
      extractionError,
      setExtractionError,
      clearCapturedImage,
      clearScanSession,
    }),
    [
      capturedImageUri,
      clearCapturedImage,
      clearExtractedIngredients,
      clearScanSession,
      extractedIngredients,
      extractionError,
      selectedCategory,
      setCapturedImageUri,
      setExtractedIngredients,
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
