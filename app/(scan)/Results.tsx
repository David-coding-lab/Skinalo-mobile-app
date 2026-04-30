import BottomNav, {
  BOTTOM_NAV_HEIGHT,
  type BottomNavItem,
} from "@/components/BottomNav";
import { useScan } from "@/context/ScanProvider";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  LinearTransition,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type IngredientTone = "good" | "neutral" | "bad";

type IngredientItem = {
  id: string;
  name: string;
  chemicalEffect: string;
  benefitText: string;
  tone: IngredientTone;
};

type RecommendationItem = {
  id: string;
  productName: string;
  why: string;
  match: string;
  image: any;
};

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "azure-serum",
    productName: "Azure Calming Serum",
    why: "Contains Cica and Panthenol to soothe redness and support your barrier.",
    match: "100% Match",
    image: require("../../assets/images/Verdant Botanics.png"),
  },
  {
    id: "pure-dew",
    productName: "Pure Dew Moisturizer",
    why: "Oil-free barrier support using bio-identical humectants.",
    match: "98% Match",
    image: require("../../assets/images/Mist & Clay.png"),
  },
];

const toneMeta: Record<
  IngredientTone,
  {
    iconName: React.ComponentProps<typeof Ionicons>["name"];
    iconColor: string;
    textColor: string;
    backgroundColor: string;
  }
> = {
  good: {
    iconName: "checkmark-circle-outline",
    iconColor: "#16A34A",
    textColor: "#15803D",
    backgroundColor: "#ECFDF3",
  },
  neutral: {
    iconName: "alert-circle-outline",
    iconColor: "#D97706",
    textColor: "#B45309",
    backgroundColor: "#FFF7E8",
  },
  bad: {
    iconName: "warning-outline",
    iconColor: "#E11D48",
    textColor: "#E11D48",
    backgroundColor: "#FFF1F5",
  },
};

const Results = () => {
  const { analysisResult } = useScan();
  const [showAllIngredients, setShowAllIngredients] = React.useState(false);
  const pathname = usePathname();
  const { bottom: bottomInset } = useSafeAreaInsets();

  function trimToParagraphs(text?: string | null, max = 2) {
    if (!text) return "";
    const paragraphs = text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length <= max) return paragraphs.join("\n\n");

    return paragraphs.slice(0, max).join("\n\n") + "…";
  }

  const theme = {
    score: analysisResult?.analysis.score ?? 0,
    badgeText: analysisResult?.analysis.badgeText ?? "",
    badgeTextColor: "#111827",
    badgeBackgroundColor: "#FFFFFF",
    accentColor: "#136DEC",
    accentSoftColor: "transparent",
    title: trimToParagraphs(analysisResult?.analysis.title ?? "", 2),
    description: trimToParagraphs(
      analysisResult?.analysis.description ?? "",
      3,
    ),
  };

  const ingredientItems: IngredientItem[] =
    analysisResult?.ingredients?.map((item) => ({
      id: item.id,
      name: item.name,
      chemicalEffect: item.chemicalEffect,
      benefitText: item.benefitText,
      tone: item.tone,
    })) ?? [];

  const recommendationItems: RecommendationItem[] = RECOMMENDATIONS;

  const COLLAPSED_INGREDIENT_COUNT = 2;
  const hasHiddenIngredients =
    ingredientItems.length > COLLAPSED_INGREDIENT_COUNT;
  const visibleIngredients = ingredientItems.slice(
    0,
    COLLAPSED_INGREDIENT_COUNT,
  );
  const hiddenIngredients = ingredientItems.slice(COLLAPSED_INGREDIENT_COUNT);
  const bottomNavItems: BottomNavItem[] = [
    {
      key: "home",
      label: "Home",
      icon: "home",
      isActive: pathname === "/",
      onPress: () => router.replace("/"),
    },
    {
      key: "scan",
      label: "Scan",
      icon: "scan",
      isActive: true,
      onPress: () => router.replace("/(scan)/Products"),
    },
    {
      key: "history",
      label: "History",
      icon: "time",
      isActive: pathname.startsWith("/history"),
      disabledHint: "History tab is coming soon",
    },
    {
      key: "profile",
      label: "Profile",
      icon: "happy",
      isActive: pathname.startsWith("/profile"),
      disabledHint: "Profile tab is coming soon",
    },
  ];

  const toggleIngredients = React.useCallback(() => {
    setShowAllIngredients((previous) => !previous);
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-pageBg"
      edges={["left", "right", "bottom"]}
    >
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingTop: 14,
            paddingBottom: BOTTOM_NAV_HEIGHT + 34 + bottomInset,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-2xl border border-[#E2E8F0] bg-white px-4 pb-5 pt-4">
            <View className="mb-2 flex-row items-start justify-end">
              <View
                className="rounded-full px-5 py-1.5"
                style={{ backgroundColor: theme.badgeBackgroundColor }}
              >
                <Text
                  className="font-publicSansSemiBold text-[14px]"
                  style={{ color: theme.badgeTextColor }}
                >
                  {theme.badgeText}
                </Text>
              </View>
            </View>

            <Text className="text-center font-publicSansSemiBold text-md tracking-[1px] text-[#64748B]">
              SAFETY SCORE
            </Text>

            <View className="mt-3 items-center">
              <View
                className="h-48 w-48 items-center justify-center rounded-full border-[10px]"
                style={{ borderColor: theme.accentColor }}
              >
                <Text
                  className="font-publicSansBold text-4xl"
                  style={{ color: "#1E293B" }}
                >
                  {theme.score}%
                </Text>
              </View>
            </View>

            <Text className="mt-4 text-center font-publicSansBold text-[35px] leading-[40px] text-[#111827]">
              {theme.title}
            </Text>

            <Text className="mt-5 mb-7 px-2 text-center font-publicSansRegular text-lg leading-6 text-[#64748B]">
              {theme.description}
            </Text>
          </View>

          <View
            className="mt-4 rounded-2xl border px-4 py-4"
            style={{
              borderColor: theme.accentSoftColor,
              backgroundColor: theme.accentSoftColor,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="bulb-outline"
                size={16}
                color={theme.accentColor}
              />
              <Text
                className="font-publicSansBold text-xl"
                style={{ color: theme.accentColor }}
              >
                Personalized Analysis
              </Text>
            </View>

            {analysisResult?.personalizedAnalysis ? (
              <Text className="mt-3 font-publicSansRegular text-lg leading-7 text-[#475569]">
                {analysisResult.personalizedAnalysis}
              </Text>
            ) : null}

            <Pressable
              className="mt-5 mb-2 self-start"
              accessibilityRole="button"
            >
              <Text
                className="font-publicSansSemiBold text-md"
                style={{ color: theme.accentColor }}
              >
                Report Issue →
              </Text>
            </Pressable>
          </View>

          <View className="mt-5 mb-3 flex-row items-center justify-between px-1">
            <Text className="font-publicSansBold text-[23px] leading-10 text-[#111827]">
              Key Ingredients
            </Text>
            <Pressable
              onPress={toggleIngredients}
              disabled={!hasHiddenIngredients}
              accessibilityRole="button"
              accessibilityLabel={
                showAllIngredients
                  ? "View fewer ingredients"
                  : "View all ingredients"
              }
            >
              <Text className="font-publicSansSemiBold text-[12px] tracking-[0.5px] text-lightBlue">
                {hasHiddenIngredients
                  ? showAllIngredients
                    ? "VIEW LESS"
                    : `VIEW ALL (${ingredientItems.length})`
                  : `VIEW ALL (${ingredientItems.length})`}
              </Text>
            </Pressable>
          </View>

          <Animated.View
            className="mt-3 gap-3"
            layout={LinearTransition.duration(280).easing(
              Easing.inOut(Easing.ease),
            )}
          >
            {visibleIngredients.map((item) => {
              const tone = toneMeta[item.tone];

              return (
                <View
                  key={item.id}
                  className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 font-publicSansBold text-xl leading-7 text-[#1E293B]">
                      {item.name}
                    </Text>
                    <Ionicons
                      name={tone.iconName}
                      size={18}
                      color={tone.iconColor}
                    />
                  </View>

                  <Text className="mt-1 font-publicSansRegular text-sm leading-5 text-[#94A3B8]">
                    Chemical Effect: {item.chemicalEffect}
                  </Text>

                  <View
                    className="mt-2 rounded-lg px-2.5 py-2"
                    style={{ backgroundColor: tone.backgroundColor }}
                  >
                    <Text
                      className="font-publicSansRegular text-sm leading-5"
                      style={{ color: tone.textColor }}
                    >
                      {item.benefitText}
                    </Text>
                  </View>
                </View>
              );
            })}

            {showAllIngredients &&
              hiddenIngredients.map((item, index) => {
                const tone = toneMeta[item.tone];

                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.duration(280)
                      .delay(index * 55)
                      .easing(Easing.out(Easing.cubic))}
                    exiting={FadeOutUp.duration(200).easing(
                      Easing.in(Easing.cubic),
                    )}
                    layout={LinearTransition.duration(260).easing(
                      Easing.inOut(Easing.ease),
                    )}
                  >
                    <View className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3">
                      <View className="flex-row items-start justify-between gap-3">
                        <Text className="flex-1 font-publicSansBold text-xl leading-7 text-[#1E293B]">
                          {item.name}
                        </Text>
                        <Ionicons
                          name={tone.iconName}
                          size={18}
                          color={tone.iconColor}
                        />
                      </View>

                      <Text className="mt-1 font-publicSansRegular text-sm leading-5 text-[#94A3B8]">
                        Chemical Effect: {item.chemicalEffect}
                      </Text>

                      <View
                        className="mt-2 rounded-lg px-2.5 py-2"
                        style={{ backgroundColor: tone.backgroundColor }}
                      >
                        <Text
                          className="font-publicSansRegular text-sm leading-5"
                          style={{ color: tone.textColor }}
                        >
                          {item.benefitText}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}
          </Animated.View>

          <View className="mt-10 flex-row items-center justify-between px-1">
            <Text className="font-publicSansBold text-[23px] leading-10 text-[#111827]">
              Recommended for you
            </Text>
            <View className="rounded-md bg-[#EAF0FA] px-2 py-1">
              <Text className="font-publicSansBold text-[10px] tracking-[0.7px] text-lightBlue">
                NEAR YOU
              </Text>
            </View>
          </View>

          <View className="mt-3 gap-3">
            {recommendationItems.map((recommendation) => (
              <View
                key={recommendation.id}
                className="flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-3 py-3"
              >
                <Image
                  source={recommendation.image}
                  className="h-20 w-20 rounded-xl"
                  resizeMode="cover"
                />

                <View className="ml-3 flex-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <Text className="flex-1 font-publicSansBold text-2xl leading-8 text-[#1E293B]">
                      {recommendation.productName}
                    </Text>
                    <View className="rounded-full bg-[#EAFBF1] px-2 py-1">
                      <Text className="font-publicSansBold text-[11px] text-[#0F9F67]">
                        {recommendation.match}
                      </Text>
                    </View>
                  </View>

                  <Text
                    className="mt-3 mb-2 font-publicSansRegular text-md leading-5 text-[#64748B]"
                    numberOfLines={2}
                  >
                    Why it&apos;s Good: {recommendation.why}
                  </Text>

                  <Pressable
                    className="mt-1 self-start"
                    accessibilityRole="button"
                  >
                    <Text className="font-publicSansBold text-sm text-lightBlue">
                      Add to routine ›
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <BottomNav items={bottomNavItems} />
      </View>
    </SafeAreaView>
  );
};

export default Results;
