import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScan } from "../../context/ScanProvider";

const FRAME_CORNER_SIZE = 30;
const FRAME_CORNER_THICKNESS = 4;

const getParamValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export default function ImagePreview() {
  const { capturedImageUri, clearCapturedImage } = useScan();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    imageUri?: string | string[];
    category?: string | string[];
  }>();

  const imageUri = getParamValue(params.imageUri) ?? capturedImageUri;
  const category = getParamValue(params.category);
  const frameSize = Math.min(width - 40, 380);

  const handleRetake = () => {
    clearCapturedImage();
    router.back();
  };

  if (!imageUri) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg px-6" edges={["bottom"]}>
        <View className="mt-16 rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8">
          <Text className="font-publicSansBold text-2xl text-[#0F172A]">
            Image not available
          </Text>
          <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
            We could not load the captured image. Try capturing again.
          </Text>
          <Pressable
            onPress={() => {
              handleRetake();
            }}
            accessibilityRole="button"
            accessibilityLabel="Back to scanner"
            className="mt-8 h-14 items-center justify-center rounded-2xl bg-primary"
          >
            <Text className="font-publicSansSemiBold text-lg text-white">
              Back to scanner
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Image
        source={{ uri: imageUri }}
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />

      <View
        pointerEvents="none"
        className="absolute bottom-0 left-0 right-0 top-0 bg-[rgba(2,6,23,0.45)]"
      />

      <SafeAreaView className="absolute left-0 right-0 top-0" edges={["top"]}>
        <View className="mt-3 flex-row items-center justify-between px-6">
          <Pressable
            onPress={() => {
              handleRetake();
            }}
            accessibilityRole="button"
            accessibilityLabel="Retake image"
            className="h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(15,23,42,0.5)]"
          >
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </Pressable>

          <View className="h-11 min-w-[190px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(15,23,42,0.5)] px-5">
            <Text className="font-publicSansSemiBold text-base tracking-[0.8px] text-white">
              CAPTURE PREVIEW
            </Text>
          </View>

          <Pressable
            onPress={() => {
              handleRetake();
            }}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
            className="h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(15,23,42,0.5)]"
          >
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </Pressable>
        </View>
      </SafeAreaView>

      <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center px-5">
        <View
          style={{ height: frameSize, width: frameSize }}
          className="relative"
        >
          <View className="absolute inset-0 rounded-[18px] border border-[rgba(255,255,255,0.2)] bg-[rgba(15,23,42,0.2)]" />

          <View
            style={[
              styles.frameCorner,
              {
                borderLeftWidth: FRAME_CORNER_THICKNESS,
                borderTopWidth: FRAME_CORNER_THICKNESS,
                left: 0,
                top: 0,
              },
            ]}
          />
          <View
            style={[
              styles.frameCorner,
              {
                borderRightWidth: FRAME_CORNER_THICKNESS,
                borderTopWidth: FRAME_CORNER_THICKNESS,
                right: 0,
                top: 0,
              },
            ]}
          />
          <View
            style={[
              styles.frameCorner,
              {
                borderBottomWidth: FRAME_CORNER_THICKNESS,
                borderLeftWidth: FRAME_CORNER_THICKNESS,
                bottom: 0,
                left: 0,
              },
            ]}
          />
          <View
            style={[
              styles.frameCorner,
              {
                borderBottomWidth: FRAME_CORNER_THICKNESS,
                borderRightWidth: FRAME_CORNER_THICKNESS,
                bottom: 0,
                right: 0,
              },
            ]}
          />

          <View style={styles.frameCenterBadge}>
            <Ionicons name="reader-outline" size={24} color="#DBEAFE" />
          </View>
        </View>
      </View>

      <SafeAreaView
        className="absolute bottom-0 left-0 right-0"
        edges={["bottom"]}
      >
        <View className="px-6 pb-6">
          <View className="rounded-2xl bg-[rgba(15,23,42,0.72)] px-4 py-3">
            {category ? (
              <Text className="font-publicSansSemiBold text-sm tracking-[0.7px] text-[#D2DAE5]">
                Category: {category}
              </Text>
            ) : null}
            <Text className="mt-2 font-publicSansRegular text-sm leading-5 text-[#E2E8F0]">
              Make sure the image has good lighting and is not blurry. Click
              Continue to generate analysis.
            </Text>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3">
            <Pressable
              onPress={() => {
                handleRetake();
              }}
              accessibilityRole="button"
              accessibilityLabel="Retake"
              className="h-14 flex-1 items-center justify-center rounded-2xl border border-[#D6DCE3] bg-[rgba(255,255,255,0.1)]"
            >
              <Text className="font-publicSansSemiBold text-base text-white">
                Retake
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/(scan)/analyzing",
                  params: {
                    imageUri,
                    category,
                  },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Continue"
              className="h-14 flex-1 items-center justify-center rounded-2xl bg-primary"
            >
              <Text className="font-publicSansSemiBold text-base text-white">
                Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  frameCorner: {
    borderColor: "#1D7EF2",
    height: FRAME_CORNER_SIZE,
    position: "absolute",
    width: FRAME_CORNER_SIZE,
  },
  frameCenterBadge: {
    alignItems: "center",
    backgroundColor: "rgba(2, 6, 23, 0.52)",
    borderColor: "rgba(219, 234, 254, 0.95)",
    borderRadius: 10,
    borderWidth: 2,
    height: 42,
    justifyContent: "center",
    left: "50%",
    marginLeft: -21,
    marginTop: -21,
    position: "absolute",
    top: "50%",
    width: 42,
  },
});
