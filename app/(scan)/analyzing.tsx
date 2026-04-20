import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { extractIngredientsFromImage } from "@/libs/ingredientExtraction";
import { useScan } from "../../context/ScanProvider";

const getParamValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export default function AnalyzingScreen() {
  const {
    capturedImageUri,
    selectedCategory,
    setExtractedIngredients,
    setExtractionError,
  } = useScan();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const params = useLocalSearchParams<{
    imageUri?: string | string[];
    category?: string | string[];
  }>();

  const imageUri = useMemo(
    () => getParamValue(params.imageUri) ?? capturedImageUri,
    [capturedImageUri, params.imageUri],
  );
  const category = useMemo(
    () => getParamValue(params.category) ?? selectedCategory,
    [params.category, selectedCategory],
  );

  const runExtraction = useCallback(async () => {
    if (!imageUri) {
      const message = "No captured image found. Please retake your scan.";
      setExtractionError(message);
      setErrorMessage(message);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setExtractionError(null);
    setExtractedIngredients([]);

    try {
      const result = await extractIngredientsFromImage({
        imageUri,
        selectedCategory: category ?? null,
      });

      setExtractedIngredients(result.ingredients);
      router.replace("/(scan)/ManualInput");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ingredient extraction failed. Please try again.";

      setExtractionError(message);
      setErrorMessage(message);
      setIsLoading(false);
    }
  }, [category, imageUri, setExtractedIngredients, setExtractionError]);

  useEffect(() => {
    void runExtraction();
  }, [runExtraction]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-pageBg px-6">
        <View className="w-full rounded-3xl border border-[#E2E8F0] bg-white px-6 py-10">
          <View className="items-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="mt-6 text-center font-publicSansBold text-3xl text-[#0F172A]">
              Analyzing Ingredients...
            </Text>
            <Text className="mt-3 text-center font-publicSansRegular text-base leading-6 text-[#64748B]">
              We are extracting ingredient text from your image. This can take a
              few seconds.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-pageBg px-6" edges={["bottom"]}>
      <View className="mt-10 rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF2F2]">
          <Ionicons name="warning-outline" size={28} color="#DC2626" />
        </View>

        <Text className="mt-5 font-publicSansBold text-3xl text-[#0F172A]">
          Extraction failed
        </Text>

        <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
          {errorMessage ||
            "We could not extract ingredients from this image. Please try again with better lighting and less blur."}
        </Text>

        <Pressable
          onPress={() => {
            void runExtraction();
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry extraction"
          className="mt-8 h-14 items-center justify-center rounded-2xl bg-primary"
        >
          <Text className="font-publicSansSemiBold text-lg text-white">
            Retry extraction
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            router.replace("/(scan)/Scanner");
          }}
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
