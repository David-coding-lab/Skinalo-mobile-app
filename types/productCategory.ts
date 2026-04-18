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

export type ProductCategoryIconName =
  | "water-outline"
  | "leaf-outline"
  | "flask-outline"
  | "eye-outline"
  | "sunny-outline"
  | "happy-outline"
  | "sparkles-outline"
  | "medkit-outline"
  | "heart-outline";

export type ProductCategoryDetail = {
  subtitle: string;
  iconName: ProductCategoryIconName;
};

export const PRODUCT_CATEGORY_DETAILS: Record<
  ProductCategory,
  ProductCategoryDetail
> = {
  Cleansers: { subtitle: "Gel, Foam, Oil, Balm", iconName: "water-outline" },
  "Toners & Mists": {
    subtitle: "Hydrating & Balancing",
    iconName: "leaf-outline",
  },
  "Serums & Oils": {
    subtitle: "Concentrated Actives",
    iconName: "flask-outline",
  },
  Moisturizers: {
    subtitle: "Creams, Lotions, Gels",
    iconName: "water-outline",
  },
  "Eye Care": { subtitle: "Creams, Serums", iconName: "eye-outline" },
  "Sun Protection": { subtitle: "SPF, Mineral", iconName: "sunny-outline" },
  "Face Masks": { subtitle: "Sheet, Clay, Sleep", iconName: "happy-outline" },
  Exfoliants: {
    subtitle: "Physical, Chemical",
    iconName: "sparkles-outline",
  },
  Treatments: { subtitle: "Acne, Dark Spots", iconName: "medkit-outline" },
  "Lip Care": { subtitle: "Repair & Protect", iconName: "heart-outline" },
};
