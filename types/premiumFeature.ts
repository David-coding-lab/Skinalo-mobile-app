import type { ImageSourcePropType } from "react-native";

export type PremiumFeatureStatus = "start-plan" | "coming-soon";

export type PremiumFeatureImageLayout = "single" | "split";

export type PremiumFeature = {
  id: string;
  name: string;
  tags: string;
  status: PremiumFeatureStatus;
  ctaLabel: string;
  iconName: string;
  imageLayout: PremiumFeatureImageLayout;
  primaryImage: ImageSourcePropType;
  secondaryImage?: ImageSourcePropType;
  primaryImageLabel?: string;
  secondaryImageLabel?: string;
};
