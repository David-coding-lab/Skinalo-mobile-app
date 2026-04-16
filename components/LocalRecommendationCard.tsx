import { Image, Text, View } from "react-native";

import type { LocalProductRecommendation } from "@/types/localProductRecommendation";

type LocalRecommendationCardProps = {
  recommendation: LocalProductRecommendation;
  width: number;
};

export default function LocalRecommendationCard({
  recommendation,
  width,
}: LocalRecommendationCardProps) {
  return (
    <View
      className="overflow-hidden rounded-2xl border border-[#E6ECE8] bg-white"
      style={{ width }}
    >
      <View className="relative">
        <Image
          source={recommendation.productImage}
          className="h-28 w-full"
          resizeMode="cover"
        />

        <View className="absolute bottom-2 left-2 rounded-md bg-[#EAF7F1] px-2 py-1">
          <Text className="font-publicSansBold text-[11px] uppercase tracking-[0.6px] text-[#1F7A58]">
            {recommendation.productTag}
          </Text>
        </View>
      </View>

      <View className="px-3.5 py-3">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-publicSansBold text-xl leading-6 text-textDark"
        >
          {recommendation.productName}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="mt-1 font-publicSansSemiBold text-sm text-textGray"
        >
          {recommendation.description}
        </Text>
      </View>
    </View>
  );
}
