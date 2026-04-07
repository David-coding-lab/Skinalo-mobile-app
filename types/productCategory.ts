export const PRODUCT_CATEGORIES = [
  "Cleansers",
  "Toners & Mists",
  "Serums & Oils",
  "Moisturizers",
  "Eye Care",
  "Sun Protection",
  "Face Masks",
  "Exfoliants",
  "Treatments",
  "Lip Care",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
