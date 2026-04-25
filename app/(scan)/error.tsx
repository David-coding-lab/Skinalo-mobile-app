import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScan } from "../../context/ScanProvider";

function getHelpfulErrorSummary(message: string | null | undefined) {
  if (!message) {
    return "We could not process this image.";
  }

  const normalized = message.toLowerCase();

  if (normalized.includes("could not detect ingredients")) {
    return "No readable ingredient text was found.";
  }

  if (normalized.includes("too large")) {
    return "The image file is too large for processing.";
  }

  if (normalized.includes("timed out") || normalized.includes("network")) {
    return "The scan timed out before analysis finished.";
  }

  if (normalized.includes("temporarily unavailable")) {
    return "We are currently facing an issue with AI analysis.";
  }

  if (normalized.includes("facing an issue with ai analysis")) {
    return "We are currently facing an issue with AI analysis.";
  }

  if (
    normalized.includes("session expired") ||
    normalized.includes("sign in")
  ) {
    return "Authentication is required to continue scanning.";
  }

  return "Ingredient extraction did not complete.";
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

  const handleReturnToInstructions = () => {
    clearCapturedImage();
    setExtractionError(null);
    router.replace("/(scan)/ScanInstructions");
  };

  const handleRetry = () => {
    router.replace("/(scan)/analyzing");
  };

  return (
    <SafeAreaView className="flex-1 bg-pageBg px-6" edges={["bottom"]}>
      <View className="mt-10 rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF2F2]">
          <Ionicons name="warning-outline" size={28} color="#DC2626" />
        </View>

        <Text className="mt-5 font-publicSansBold text-3xl text-[#0F172A]">
          Scan could not be completed
        </Text>

        <Text className="mt-2 font-publicSansSemiBold text-base text-[#334155]">
          {getHelpfulErrorSummary(errorMessage)}
        </Text>

        <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
          {errorMessage ||
            "We could not extract ingredients from this image. Please try again with better lighting and less blur."}
        </Text>

        <View className="mt-5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
          <Text className="font-publicSansSemiBold text-sm text-[#0F172A]">
            Tips for the next attempt
          </Text>
          <Text className="mt-2 font-publicSansRegular text-sm leading-6 text-[#475569]">
            Keep the full ingredient list in frame, avoid glare, and hold the
            camera parallel to the label.
          </Text>
        </View>

        <Pressable
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry extraction"
          className="mt-8 h-14 items-center justify-center rounded-2xl bg-primary"
        >
          <Text className="font-publicSansSemiBold text-lg text-white">
            Retry extraction
          </Text>
        </Pressable>

        <Pressable
          onPress={handleReturnToInstructions}
          accessibilityRole="button"
          accessibilityLabel="Retake image"
          className="mt-4 h-14 items-center justify-center rounded-2xl border border-[#D6DCE3] bg-white"
        >
          <Text className="font-publicSansSemiBold text-lg text-[#0F172A]">
            Retake image
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            router.replace("/(scan)/ManualInput");
          }}
          accessibilityRole="button"
          accessibilityLabel="Continue to manual input"
          className="mt-4 h-14 items-center justify-center rounded-2xl border border-[#D6DCE3] bg-white"
        >
          <Text className="font-publicSansSemiBold text-lg text-[#0F172A]">
            Continue manually
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
