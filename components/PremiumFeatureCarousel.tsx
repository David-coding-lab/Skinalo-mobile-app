import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import type { PremiumFeature } from "@/types/premiumFeature";

import PremiumFeatureCard from "./PremiumFeatureCard";

type PremiumFeatureCarouselProps = {
  features: PremiumFeature[];
};

const AUTOPLAY_INTERVAL_MS = 5000;

export default function PremiumFeatureCarousel({
  features,
}: PremiumFeatureCarouselProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<PremiumFeature>>(null);
  const activeIndexRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAppActive, setIsAppActive] = useState(true);

  const goToIndex = useCallback(
    (index: number, animated: boolean) => {
      const next = Math.max(0, Math.min(index, features.length - 1));
      listRef.current?.scrollToOffset({
        offset: next * width,
        animated,
      });
      activeIndexRef.current = next;
      setActiveIndex(next);
    },
    [features.length, width],
  );

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      const boundedIndex = Math.max(
        0,
        Math.min(nextIndex, features.length - 1),
      );
      activeIndexRef.current = boundedIndex;
      setActiveIndex(boundedIndex);
      setIsDragging(false);
    },
    [features.length, width],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setIsAppActive(state === "active");
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    if (features.length <= 1 || !isAppActive || isDragging) return;

    const intervalId = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % features.length;
      goToIndex(nextIndex, true);
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [features.length, goToIndex, isAppActive, isDragging]);

  const cardWidth = Math.max(width - 24, 280);

  return (
    <View className="mt-[18px] w-full pb-3 pt-2">
      <View className="flex-row items-center justify-between px-4 pb-5">
        <View>
          <Text className="font-publicSansExtraBold text-xs leading-[14px] tracking-[1px] text-premiumColors-dark">
            PREMIUM
          </Text>
          <Text className="mt-0.5 font-publicSansBold text-2xl leading-[39px] text-textDark">
            Skinalo Pro
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-md bg-[rgba(143,0,255,0.1)] px-3 py-1.5">
          <Ionicons name="flash" size={14} color="#8F00FF" />
          <Text className="font-publicSansSemiBold text-sm text-premiumColors-dark">
            Packages
          </Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        bounces={false}
        data={features}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => setIsDragging(true)}
        onScrollEndDrag={() => setIsDragging(false)}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) => (
          <View className="items-center pt-2.5" style={{ width }}>
            <PremiumFeatureCard feature={item} width={cardWidth} />
          </View>
        )}
      />

      <View className="mt-3 flex-row items-center justify-center gap-2">
        {features.map((feature, index) => {
          const active = index === activeIndex;

          return (
            <Pressable
              key={feature.id}
              onPress={() => goToIndex(index, true)}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${feature.name}`}
              className={
                active
                  ? "h-1.5 w-5 rounded-full bg-premiumColors-light"
                  : "h-1.5 w-1.5 rounded-full bg-[rgba(255,255,255,0.45)]"
              }
            />
          );
        })}
      </View>
    </View>
  );
}
