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
  details: string;
  tips: string[];
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

  if (
    normalized.includes("temporarily unavailable") ||
    normalized.includes("service unavailable") ||
    normalized.includes("timed out") ||
    normalized.includes("network")
  ) {
    return {
      code: "503",
      title: "Analysis paused",
      summary: "The analysis service is temporarily unavailable.",
      details:
        "Your ingredients are still available. Try again in a few minutes, or review the input if you want to make a quick change before retrying.",
      tips: [
        "Come back later and retry the analysis from the same ingredients.",
        "Keep the current product details saved so you do not need to rebuild them.",
        "If the service remains unstable, return to manual input and continue when ready.",
      ],
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
      details:
        "Open manual input, update the category or ingredient list, and launch analysis again once everything is ready.",
      tips: [
        "Choose the category that best matches the product first.",
        "Make sure the ingredient list has at least three items.",
        "Once the inputs are updated, retry the analysis from manual input.",
      ],
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
      details:
        "The analysis request could not complete because the current session is no longer valid.",
      tips: [
        "Sign in again to restore access to the analysis flow.",
        "Return to the saved ingredients after you are back in the app.",
        "You can also restart from the home screen if that is faster.",
      ],
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
    details:
      message ||
      "The analysis service returned an unexpected error. Review the inputs and try again.",
    tips: [
      "Try the analysis again if the issue was temporary.",
      "Review the ingredient list and category before retrying.",
      "If needed, start a fresh scan from the beginning.",
    ],
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
