import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { ProductCategory } from "@/types/productCategory";

type ScanContextValue = {
  selectedCategory: ProductCategory | null;
  setSelectedCategory: (category: ProductCategory | null) => void;
  clearScanSession: () => void;
};

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

type ScanProviderProps = {
  children: ReactNode;
};

export function ScanProvider({ children }: ScanProviderProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | null>(null);

  const clearScanSession = () => {
    setSelectedCategory(null);
  };

  const value = useMemo(
    () => ({ selectedCategory, setSelectedCategory, clearScanSession }),
    [selectedCategory],
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
