import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { extractIngredientsFromImage } from "@/libs/ingredientExtraction";
import { useScan } from "../../context/ScanProvider";

const DUMMY_TIPS = [
  "Over 80% of skincare effectiveness depends on ingredient synergy, not only single compounds.",
  "Good lighting and clean focus can significantly improve OCR ingredient extraction quality.",
  "Tiny label text is easier to parse when the camera is centered and parallel to the bottle.",
  "Capturing the full INCI list helps reduce missing ingredients in your final analysis.",
];

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
  const [progress, setProgress] = useState(12);
  const [tipIndex, setTipIndex] = useState(0);
  const params = useLocalSearchParams<{
    imageUri?: string | string[];
    category?: string | string[];
  }>();
  const orbitRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const imageUri = useMemo(
    () => getParamValue(params.imageUri) ?? capturedImageUri,
    [capturedImageUri, params.imageUri],
  );
  const category = useMemo(
    () => getParamValue(params.category) ?? selectedCategory,
    [params.category, selectedCategory],
  );

  useEffect(() => {
    orbitRotation.value = withRepeat(
      withTiming(360, {
        duration: 3200,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    pulseScale.value = withRepeat(
      withTiming(1.08, {
        duration: 1400,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [orbitRotation, pulseScale]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 94) {
          return previous;
        }

        const next = previous + (Math.random() * 8 + 2);
        return Math.min(next, 94);
      });
    }, 850);

    const tipsInterval = setInterval(() => {
      setTipIndex((previous) => (previous + 1) % DUMMY_TIPS.length);
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(tipsInterval);
    };
  }, [isLoading]);

  const processLabel = useMemo(() => {
    if (progress < 35) {
      return "Preparing image for OCR";
    }

    if (progress < 70) {
      return "Scanning chemical compounds";
    }

    return "Structuring ingredient output";
  }, [progress]);

  const orbitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

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
    setProgress(12);
    setTipIndex(0);

    try {
      const result = await extractIngredientsFromImage({
        imageUri,
        selectedCategory: category ?? null,
      });

      setProgress(100);
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
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient
              id="analyzingBg"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#EEF3FB" />
              <Stop offset="55%" stopColor="#F6FAFF" />
              <Stop offset="100%" stopColor="#EAF6EE" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#analyzingBg)" />
        </Svg>

        <View className="flex-1 px-6 pb-8 pt-4">
          <View className="items-center">
            <View style={styles.loaderArea}>
              <View style={styles.outerRing} />

              <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />

              <Animated.View
                style={[styles.orbitContainer, orbitAnimatedStyle]}
              >
                <View style={styles.orbitDot} />
              </Animated.View>

              <View style={styles.coreBadge}>
                <Ionicons name="flask-outline" size={44} color="#1D64D8" />
              </View>
            </View>

            <Text className="mt-2 text-center font-publicSansBold text-[41px] leading-[56px] text-[#374151]">
              Analyzing Ingredients...
            </Text>
            <Text className="mt-2 text-center font-publicSansRegular text-[14px] leading-6 text-[#64748B]">
              Understanding What&apos;s Inside Your Skincare
            </Text>

            <View className="mt-12 w-full">
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="font-publicSansBold text-[20px] tracking-[1.2px] text-[#2563EB]">
                    CURRENT PROCESS
                  </Text>
                  <Text className="mt-1 font-publicSansSemiBold text-[28px] leading-[44px] text-[#374151]">
                    {processLabel}
                  </Text>
                </View>

                <View className="flex-row items-end">
                  <Text className="font-publicSansBold text-[46px] leading-[56px] text-[#374151]">
                    {Math.round(progress)}
                  </Text>
                  <Text className="mb-1 ml-1 font-publicSansBold text-[24px] leading-8 text-[#64748B]">
                    %
                  </Text>
                </View>
              </View>

              <View className="mt-4 h-3 w-full rounded-full bg-[#D4DCE8]">
                <View
                  className="h-3 rounded-full bg-[#2563EB]"
                  style={{ width: `${Math.max(6, progress)}%` }}
                />
              </View>

              <View className="mt-6 flex-row items-center justify-center gap-2">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color="#10B981"
                />
                <Text className="font-publicSansSemiBold text-[14px] text-[#94A3B8]">
                  AI-Powered Precision Analysis
                </Text>
              </View>
            </View>

            <View className="mt-14 w-full rounded-2xl border border-[#C9D8F5] bg-[#E8F4FF] px-5 py-5">
              <View className="flex-row items-center gap-2">
                <Ionicons name="bulb-outline" size={20} color="#2563EB" />
                <Text className="font-publicSansBold text-[19px] text-[#1E293B]">
                  Did you know?
                </Text>
              </View>

              <Text className="mt-3 font-publicSansRegular text-[18px] leading-8 text-[#475569]">
                {DUMMY_TIPS[tipIndex]}
              </Text>
            </View>

            <Text className="mt-8 text-center font-publicSansBold text-[14px] tracking-[4px] text-[#94A3B8]">
              SCIENCE-FIRST SKINCARE
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

const styles = StyleSheet.create({
  loaderArea: {
    alignItems: "center",
    height: 260,
    justifyContent: "center",
    marginTop: 8,
    width: 260,
  },
  orbitContainer: {
    alignItems: "center",
    height: 220,
    justifyContent: "flex-start",
    position: "absolute",
    width: 220,
  },
  orbitDot: {
    backgroundColor: "#10B981",
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  outerRing: {
    borderColor: "#BED8FF",
    borderRadius: 999,
    borderWidth: 2,
    height: 220,
    position: "absolute",
    width: 220,
  },
  pulseRing: {
    borderColor: "#7FD7C2",
    borderRadius: 999,
    borderWidth: 2,
    height: 180,
    opacity: 0.45,
    position: "absolute",
    width: 180,
  },
  coreBadge: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    height: 110,
    justifyContent: "center",
    width: 110,
  },
});
