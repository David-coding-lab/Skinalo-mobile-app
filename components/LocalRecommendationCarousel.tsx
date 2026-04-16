import { FlatList, Text, View, useWindowDimensions } from "react-native";

import type { LocalProductRecommendation } from "@/types/localProductRecommendation";

import LocalRecommendationCard from "./LocalRecommendationCard";

type LocalRecommendationCarouselProps = {
  recommendations: LocalProductRecommendation[];
  country?: string;
};

export default function LocalRecommendationCarousel({
  recommendations,
  country,
}: LocalRecommendationCarouselProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(160, Math.min((width - 52) / 2, 210));
  const itemWidth = cardWidth + 12;
  const countryLabel = country?.trim() || null;

  return (
    <View className="mt-8 w-full pb-6">
      <View className="px-5">
        <Text className="font-publicSansBold text-xl text-textDark">
          {`Best For Your Skin In ${countryLabel}`}
        </Text>
      </View>

      <FlatList
        horizontal
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LocalRecommendationCard recommendation={item} width={cardWidth} />
        )}
        ItemSeparatorComponent={() => <View className="w-3" />}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 4,
        }}
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        disableIntervalMomentum
      />
    </View>
  );
}
