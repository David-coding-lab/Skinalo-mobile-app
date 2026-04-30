import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScan } from "@/context/ScanProvider";

type ScanErrorDetails = {
  code: string;
  title: string;
  summary: string;
  accentColor: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
};

function getScanErrorDetails(
  message: string | null | undefined,
): ScanErrorDetails {
  const normalized = (message || "").toLowerCase();

  if (normalized.includes("service unavailable")) {
    return {
      code: "503",
      title: "Service unavailable",
      summary: "The scan service is taking a break right now.",
      accentColor: "#2563EB",
      iconName: "cloud-offline-outline",
    };
  }

  if (
    normalized.includes("temporarily unavailable") ||
    normalized.includes("facing an issue with ai analysis")
  ) {
    return {
      code: "503",
      title: "Analysis service unavailable",
      summary: "The AI scan service is having trouble completing this request.",
      accentColor: "#0F766E",
      iconName: "pulse-outline",
    };
  }

  if (normalized.includes("could not detect ingredients")) {
    return {
      code: "400",
      title: "No readable ingredient text",
      summary: "The label text was too hard to read.",
      accentColor: "#B45309",
      iconName: "text-outline",
    };
  }

  if (normalized.includes("too large")) {
    return {
      code: "413",
      title: "Image too large",
      summary: "The file needs to be a bit smaller before it can be processed.",
      accentColor: "#7C3AED",
      iconName: "image-outline",
    };
  }

  if (normalized.includes("timed out") || normalized.includes("network")) {
    return {
      code: "408",
      title: "Scan timed out",
      summary: "The image took too long to finish processing.",
      accentColor: "#EA580C",
      iconName: "wifi-outline",
    };
  }

  if (
    normalized.includes("session expired") ||
    normalized.includes("sign in")
  ) {
    return {
      code: "401",
      title: "Session needed",
      summary: "You need to sign in again before scanning.",
      accentColor: "#1D4ED8",
      iconName: "shield-checkmark-outline",
    };
  }

  return {
    code: "500",
    title: "Scan could not be completed",
    summary: "We could not process this image. Try again after some time",
    accentColor: "#DC2626",
    iconName: "warning-outline",
  };
}

export default function ErrorScreen() {
  const { clearCapturedImage, setExtractionError } = useScan();
  const params = useLocalSearchParams<{ errorMessage?: string }>();

  // Handle array of strings or single string
  const extractMessageParam = (msg?: string | string[]) => {
    if (Array.isArray(msg)) return msg[0];
    return msg;
  };

  const errorMessage = extractMessageParam(params.errorMessage);
  const errorDetails = useMemo(
    () => getScanErrorDetails(errorMessage),
    [errorMessage],
  );

  const handleReturnToInstructions = () => {
    clearCapturedImage();
    setExtractionError(null);
    router.replace("/(scan)/ScanInstructions");
  };

  const handleRetry = () => {
    router.replace("/(scan)/analyzing");
  };

  return (
    <SafeAreaView className="flex-1 bg-pageBg" edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 20,
        }}
      >
        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border border-[#DCEBDC] bg-white">
              <Ionicons
                name={errorDetails.iconName}
                size={40}
                color={errorDetails.accentColor}
              />
            </View>

            <Text
              className="font-publicSansBold text-[64px] leading-[64px] tracking-[-2.5px]"
              style={{ color: errorDetails.accentColor }}
            >
              {errorDetails.code}
            </Text>

            <Text className="mt-2 max-w-[260px] text-center font-publicSansBold text-[24px] leading-[30px] text-[#1F1B2E]">
              {errorDetails.title}
            </Text>

            <Text className="mt-2 max-w-[270px] text-center font-publicSansRegular text-[14px] leading-6 text-[#5E5A6A]">
              {errorDetails.summary}
            </Text>
          </View>

          <View className="mt-8 w-full max-w-[240px]">
            <Pressable
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry extraction"
              className="h-12 items-center justify-center rounded-2xl bg-primary"
            >
              <Text className="font-publicSansSemiBold text-[15px] text-white">
                Retry extraction
              </Text>
            </Pressable>

            <Pressable
              onPress={handleReturnToInstructions}
              accessibilityRole="button"
              accessibilityLabel="Retake image"
              className="mt-4 items-center justify-center py-1.5"
            >
              <Text className="font-publicSansSemiBold text-[14px] text-primary">
                Retake image
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                router.replace("/(scan)/ManualInput");
              }}
              accessibilityRole="button"
              accessibilityLabel="Continue to manual input"
              className="mt-2 items-center justify-center py-2"
            >
              <Text className="font-publicSansRegular text-[14px] text-[#5E5A6A] underline underline-offset-4">
                Continue manually
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
