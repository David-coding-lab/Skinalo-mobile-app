import type { ImageSourcePropType } from "react-native";

export const BODY_PRODUCT_TAGS = [
  "Cream",
  "Face Wash",
  "Soap",
  "Serum",
  "Body Oil",
  "Sunscreen",
] as const;

export type BodyProductTag = (typeof BODY_PRODUCT_TAGS)[number];

export type LocalProductRecommendation = {
  id: string;
  productName: string;
  description: string;
  productImage: ImageSourcePropType;
  productTag: BodyProductTag;
};
