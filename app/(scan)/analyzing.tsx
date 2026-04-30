import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { useScan } from "@/context/ScanProvider";
import { getAnalysisStatus, startAnalysis } from "@/libs/analysisEngine";
import { extractIngredientsFromImage } from "@/libs/ingredientExtraction";

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
    extractedIngredients,
    setExtractedIngredients,
    setExtractionError,
    setAnalysisRequestId,
    setAnalysisStatus,
    setAnalysisResult,
    setAnalysisError,
    clearCapturedImage,
  } = useScan();
  const [progress, setProgress] = useState(12);
  const [tipIndex, setTipIndex] = useState(0);
  const hasStartedFlowRef = useRef(false);
  const activeRunIdRef = useRef(0);
  const params = useLocalSearchParams<{
    imageUri?: string | string[];
    category?: string | string[];
    ingredients?: string | string[];
    mode?: "ingredients" | "analysis" | string | string[];
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
  const scanMode = useMemo(
    () => getParamValue(params.mode) ?? "ingredients",
    [params.mode],
  );
  const ingredientsParam = useMemo(
    () => getParamValue(params.ingredients),
    [params.ingredients],
  );
  const analysisIngredients = useMemo(() => {
    if (ingredientsParam && typeof ingredientsParam === "string") {
      try {
        const parsed = JSON.parse(ingredientsParam);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is string => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      } catch {
        // Fall back to context ingredients.
      }
    }

    return extractedIngredients;
  }, [extractedIngredients, ingredientsParam]);

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
  }, []);

  const processLabel = useMemo(() => {
    if (scanMode === "analysis") {
      if (progress < 35) return "Checking cached analysis";
      if (progress < 70) return "Analyzing chemical compounds";
      return "Structuring personalized result";
    }

    if (progress < 35) {
      return "Preparing image for text recognition";
    }

    if (progress < 70) {
      return "Reading component names";
    }

    return "Organizing ingredient list";
  }, [progress, scanMode]);

  const orbitAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleReturnToInstructions = useCallback(() => {
    clearCapturedImage();
    setExtractionError(null);
    router.replace("/(scan)/ScanInstructions");
  }, [clearCapturedImage, setExtractionError]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleReturnToInstructions();
          return true;
        },
      );

      return () => {
        subscription.remove();
      };
    }, [handleReturnToInstructions]),
  );

  const runExtraction = useCallback(async () => {
    if (hasStartedFlowRef.current) {
      return;
    }

    hasStartedFlowRef.current = true;

    if (scanMode === "analysis") {
      const runId = activeRunIdRef.current + 1;
      activeRunIdRef.current = runId;

      setExtractionError(null);
      setAnalysisError(null);
      setAnalysisResult(null);
      setAnalysisStatus("idle");
      setAnalysisRequestId(null);
      setProgress(12);
      setTipIndex(0);

      if (!category) {
        if (activeRunIdRef.current !== runId) {
          return;
        }

        const message =
          "Product category is missing. Please choose a category and retry.";
        setAnalysisStatus("failed");
        setAnalysisError(message);
        setExtractionError(null);
        router.replace({
          pathname: "/(analysis)/error",
          params: { errorMessage: message },
        });
        return;
      }

      if (analysisIngredients.length < 3) {
        if (activeRunIdRef.current !== runId) {
          return;
        }

        const message =
          "Please provide at least 3 ingredients before analysis.";
        setAnalysisStatus("failed");
        setAnalysisError(message);
        setExtractionError(null);
        router.replace({
          pathname: "/(analysis)/error",
          params: { errorMessage: message },
        });
        return;
      }

      try {
        if (activeRunIdRef.current !== runId) {
          return;
        }

        const startResponse = await startAnalysis({
          selectedCategory: category,
          ingredients: analysisIngredients,
        });

        if (activeRunIdRef.current !== runId) {
          return;
        }

        setAnalysisRequestId(startResponse.analysisRequestId || null);

        if (startResponse.status === "completed" && startResponse.ok) {
          setAnalysisResult(startResponse.result);
          setAnalysisStatus("completed");
          setProgress(100);
          router.replace("/(scan)/Results");
          return;
        }

        if (!startResponse.analysisRequestId) {
          throw new Error(
            "Analysis response is missing request tracking metadata. Please redeploy the latest analysis function.",
          );
        }

        setAnalysisStatus("accepted");

        const analysisRequestId = startResponse.analysisRequestId;

        const maxPollAttempts = 14;
        for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
          if (activeRunIdRef.current !== runId) {
            return;
          }

          const statusResponse = await getAnalysisStatus(analysisRequestId);

          if (activeRunIdRef.current !== runId) {
            return;
          }

          if (statusResponse.status === "completed" && statusResponse.ok) {
            setAnalysisResult(statusResponse.result);
            setAnalysisStatus("completed");
            setProgress(100);
            router.replace("/(scan)/Results");
            return;
          }

          setAnalysisStatus("processing");
          await new Promise<void>((resolve) => {
            setTimeout(resolve, 1800);
          });
        }

        throw new Error("Analysis timed out. Please try again.");
      } catch (err) {
        if (activeRunIdRef.current !== runId) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Analysis failed. Please try again.";

        setAnalysisStatus("failed");
        setAnalysisError(message);
        setExtractionError(null);
        router.replace({
          pathname: "/(analysis)/error",
          params: { errorMessage: message },
        });
      }

      return;
    }

    if (!imageUri) {
      const message = "No captured image found. Please retake your scan.";
      setExtractionError(message);
      router.replace({
        pathname: "/(scan)/error",
        params: { errorMessage: message },
      });
      return;
    }

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
      router.replace("/(scan)/ManualInput"); // Navigate to manual input for ingredients
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ingredient extraction failed. Please try again.";

      setExtractionError(message);
      router.replace({
        pathname: "/(scan)/error",
        params: { errorMessage: message },
      });
    }
  }, [
    category,
    analysisIngredients,
    imageUri,
    scanMode,
    setAnalysisError,
    setAnalysisRequestId,
    setAnalysisResult,
    setAnalysisStatus,
    setExtractedIngredients,
    setExtractionError,
  ]);

  useEffect(() => {
    void runExtraction();
  }, [runExtraction]);

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="analyzingBg" x1="0%" y1="0%" x2="100%" y2="100%">
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

            <Animated.View style={[styles.orbitContainer, orbitAnimatedStyle]}>
              <View style={styles.orbitDot} />
            </Animated.View>

            <View style={styles.coreBadge}>
              <Ionicons name="flask-outline" size={44} color="#1D64D8" />
            </View>
          </View>

          <Text className="mt-2 text-center font-publicSansRegular text-3xl leading-[56px] text-[#374151]">
            {scanMode === "analysis"
              ? "Analyzing Product..."
              : "Extracting Ingredients..."}
          </Text>
          <Text className="mt-2 text-center font-publicSansRegular text-lg leading-6 text-[#64748B]">
            {scanMode === "analysis"
              ? "Understanding What's Inside Your Skincare"
              : "Processing image to extract component names"}
          </Text>

          <View className="mt-32 w-full">
            <View className="flex-row items-end justify-between">
              <View>
                <Text className="font-publicSansBold text-sm tracking-[1.2px] text-[#2563EB]">
                  CURRENT PROCESS
                </Text>
                <Text className="mt-1 font-publicSansSemiBold text-xl leading-[44px] text-[#374151]">
                  {processLabel}
                </Text>
              </View>

              <View className="flex-row items-center justify-center">
                <Text className="font-publicSansBold text-xl leading-[56px] text-[#374151]">
                  {Math.round(progress)}
                </Text>
                <Text className="mb-1 ml-1 font-publicSansBold text-xl leading-8 text-[#64748B]">
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

          <View className="mt-24 w-full rounded-2xl border border-[#C9D8F5] bg-[#E8F4FF] px-5 py-5">
            <View className="flex-row items-center gap-2">
              <Ionicons name="bulb-outline" size={20} color="#2563EB" />
              <Text className="font-publicSansBold text-lg text-[#1E293B]">
                Did you know?
              </Text>
            </View>

            <Text className="mt-3 font-publicSansRegular text-sm leading-8 text-[#475569]">
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
