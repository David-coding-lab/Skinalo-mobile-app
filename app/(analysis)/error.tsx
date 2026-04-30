import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useScan } from "@/context/ScanProvider";

type AnalysisErrorState = {
  code: string;
  title: string;
  summary: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  primaryAction: () => void;
  secondaryAction: () => void;
  badgeLabel: string;
  accentColor: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  iconBg: string;
};

function getAnalysisErrorState(
  message: string | null | undefined,
  actions: {
    retry: () => void;
    review: () => void;
    restart: () => void;
    signIn: () => void;
  },
): AnalysisErrorState {
  const normalized = (message || "").toLowerCase();

  // Check for network errors first (most specific)
  if (
    normalized.includes("network") ||
    normalized.includes("failed to fetch") ||
    normalized.includes("failed to connect") ||
    normalized.includes("no internet") ||
    normalized.includes("offline") ||
    normalized.includes("econnrefused") ||
    normalized.includes("enotfound")
  ) {
    return {
      code: "521",
      title: "Network error",
      summary: "Could not connect to the analysis service.",
      primaryActionLabel: "Retry analysis",
      secondaryActionLabel: "Review ingredients",
      primaryAction: actions.retry,
      secondaryAction: actions.review,
      badgeLabel: "NETWORK ERROR",
      accentColor: "#0F766E",
      bgGradientStart: "#F0FEF9",
      bgGradientEnd: "#E0FDF4",
      iconBg: "#D1F9EE",
    };
  }

  if (
    normalized.includes("temporarily unavailable") ||
    normalized.includes("service unavailable")
  ) {
    return {
      code: "503",
      title: "Analysis paused",
      summary: "The analysis service is temporarily unavailable.",
      primaryActionLabel: "Retry analysis",
      secondaryActionLabel: "Review ingredients",
      primaryAction: actions.retry,
      secondaryAction: actions.review,
      badgeLabel: "SERVICE ISSUE",
      accentColor: "#2D6A4F",
      bgGradientStart: "#F0F8F4",
      bgGradientEnd: "#E6F4EC",
      iconBg: "#D9F0E3",
    };
  }

  if (normalized.includes("timed out")) {
    return {
      code: "408",
      title: "Request timed out",
      summary: "The analysis took too long to complete.",
      primaryActionLabel: "Retry analysis",
      secondaryActionLabel: "Review ingredients",
      primaryAction: actions.retry,
      secondaryAction: actions.review,
      badgeLabel: "TIMEOUT",
      accentColor: "#EA580C",
      bgGradientStart: "#FEF5E8",
      bgGradientEnd: "#FDE9D3",
      iconBg: "#FDCEB0",
    };
  }

  if (
    normalized.includes("at least 3 ingredients") ||
    normalized.includes("category is missing") ||
    normalized.includes("product category is missing")
  ) {
    return {
      code: "400",
      title: "Input needs attention",
      summary:
        "The analysis could not start because the inputs are incomplete.",
      primaryActionLabel: "Edit inputs",
      secondaryActionLabel: "Start over",
      primaryAction: actions.review,
      secondaryAction: actions.restart,
      badgeLabel: "INPUT ISSUE",
      accentColor: "#2D6A4F",
      bgGradientStart: "#F7FBF8",
      bgGradientEnd: "#ECF7F1",
      iconBg: "#DFF3E9",
    };
  }

  if (
    normalized.includes("session expired") ||
    normalized.includes("sign in") ||
    normalized.includes("unauthorized")
  ) {
    return {
      code: "401",
      title: "Session required",
      summary: "You need to sign in again before analysis can continue.",
      primaryActionLabel: "Sign in again",
      secondaryActionLabel: "Review ingredients",
      primaryAction: actions.signIn,
      secondaryAction: actions.review,
      badgeLabel: "SESSION ISSUE",
      accentColor: "#2D6A4F",
      bgGradientStart: "#F4FAF6",
      bgGradientEnd: "#EAF6EE",
      iconBg: "#E0F4E7",
    };
  }

  return {
    code: "500",
    title: "Analysis could not finish",
    summary: "We could not complete the product analysis.",
    primaryActionLabel: "Retry analysis",
    secondaryActionLabel: "Review ingredients",
    primaryAction: actions.retry,
    secondaryAction: actions.review,
    badgeLabel: "ANALYSIS ERROR",
    accentColor: "#2D6A4F",
    bgGradientStart: "#F6FBF8",
    bgGradientEnd: "#ECF8F1",
    iconBg: "#DFF2E8",
  };
}

export default function AnalysisErrorScreen() {
  const {
    selectedCategory,
    extractedIngredients,
    clearAnalysisState,
    clearCapturedImage,
  } = useScan();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const params = useLocalSearchParams<{ errorMessage?: string }>();

  const errorMessage = useMemo(() => {
    const value = params.errorMessage;
    return Array.isArray(value) ? value[0] : value;
  }, [params.errorMessage]);

  const analysisState = useMemo(
    () =>
      getAnalysisErrorState(errorMessage, {
        retry: () => {
          clearAnalysisState();
          router.replace({
            pathname: "/(scan)/analyzing",
            params: {
              mode: "analysis",
              category: selectedCategory || undefined,
              ingredients: JSON.stringify(extractedIngredients),
            },
          });
        },
        review: () => {
          clearAnalysisState();
          router.replace("/(scan)/ManualInput");
        },
        restart: () => {
          clearCapturedImage();
          router.replace("/(scan)/ScanInstructions");
        },
        signIn: () => {
          clearAnalysisState();
          router.replace("/(auth)/sign-in");
        },
      }),
    [
      clearAnalysisState,
      clearCapturedImage,
      errorMessage,
      extractedIngredients,
      selectedCategory,
    ],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FBFCFA]" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: bottomInset + 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center">
          <View
            className="mb-8 h-24 w-24 items-center justify-center rounded-full border border-[#D8EBDD] bg-white"
            style={{
              shadowColor: "#2D6A4F",
              shadowOpacity: 0.1,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 3,
            }}
          >
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={analysisState.accentColor}
            />
          </View>

          <Text
            className="font-publicSansBold text-[72px] leading-[72px] tracking-[-3px]"
            style={{ color: analysisState.accentColor }}
          >
            {analysisState.code}
          </Text>

          <Text className="mt-3 text-center font-publicSansBold text-[28px] leading-[34px] text-[#1F1B2E]">
            {analysisState.title}
          </Text>

          <Text className="mt-3 max-w-[300px] text-center font-publicSansRegular text-[15px] leading-6 text-[#5E5A6A]">
            {analysisState.summary}
          </Text>

          <View className="mt-10 w-full max-w-[250px]">
            <Pressable
              onPress={analysisState.primaryAction}
              accessibilityRole="button"
              accessibilityLabel={analysisState.primaryActionLabel}
              className="h-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: analysisState.accentColor }}
            >
              <Text className="font-publicSansSemiBold text-[15px] text-white">
                {analysisState.primaryActionLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={analysisState.secondaryAction}
              accessibilityRole="button"
              accessibilityLabel={analysisState.secondaryActionLabel}
              className="mt-4 items-center justify-center py-2"
            >
              <Text
                className="font-publicSansSemiBold text-[14px]"
                style={{ color: analysisState.accentColor }}
              >
                {analysisState.secondaryActionLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
