import { Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  type CameraCapturedPicture,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "@/components/PrimaryButton";
import { useScan } from "../../context/ScanProvider";

const FRAME_CORNER_SIZE = 30;
const FRAME_CORNER_THICKNESS = 4;

export default function Scanner() {
  const { selectedCategory, capturedImageUri, setCapturedImageUri } = useScan();
  const { width } = useWindowDimensions();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [isTorchEnabled, setIsTorchEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [galleryNotice, setGalleryNotice] = useState<string | null>(null);
  const scanLineProgress = useSharedValue(0);

  const frameSize = Math.min(width - 40, 380);
  const scanLineTravel = Math.max(frameSize - 56, 0);

  useEffect(() => {
    scanLineProgress.value = withRepeat(
      withTiming(1, {
        duration: 2200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    return () => {
      scanLineProgress.value = 0;
    };
  }, [scanLineProgress]);

  useEffect(() => {
    if (!galleryNotice) {
      return;
    }

    const timeout = setTimeout(() => {
      setGalleryNotice(null);
    }, 2500);

    return () => {
      clearTimeout(timeout);
    };
  }, [galleryNotice]);

  const scanLineAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLineProgress.value * scanLineTravel }],
    };
  });

  const openPreview = (imageUri: string, source: "camera" | "gallery") => {
    setCapturedImageUri(imageUri);

    router.replace({
      pathname: "/(scan)/ImagePreview",
      params: {
        imageUri,
        source,
        category: selectedCategory,
      },
    });
  };

  const handleOpenGallery = async () => {
    try {
      const permissionResponse = mediaLibraryPermission?.granted
        ? mediaLibraryPermission
        : await requestMediaLibraryPermission();

      if (!permissionResponse?.granted) {
        setGalleryNotice("Allow gallery access to import an ingredient image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.7,
        selectionLimit: 1,
      });

      if (result.canceled) {
        setGalleryNotice("No image selected.");
        return;
      }

      const selectedUri = result.assets[0]?.uri ?? null;

      if (!selectedUri) {
        setGalleryNotice("Unable to read selected image.");
        return;
      }

      openPreview(selectedUri, "gallery");
    } catch {
      setGalleryNotice("Could not open gallery. Please try again.");
    }
  };

  const handleCapturePhoto = async () => {
    if (isCapturing || !cameraRef.current) {
      return;
    }

    try {
      setIsCapturing(true);

      const photo: CameraCapturedPicture | undefined =
        await cameraRef.current.takePictureAsync({
          quality: 0.65,
          skipProcessing: true,
        });

      if (!photo?.uri) {
        setGalleryNotice("Could not capture image. Try again.");
        return;
      }

      openPreview(photo.uri, "camera");
    } catch {
      setGalleryNotice("Could not capture image. Try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (!selectedCategory) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg px-6" edges={["bottom"]}>
        <View className="mt-16 rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8">
          <Text className="font-publicSansBold text-2xl text-[#0F172A]">
            Missing category context
          </Text>
          <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
            Go back and choose a product category before starting a scan.
          </Text>
          <PrimaryButton
            text="Back to categories"
            callBack={() => {
              router.replace("/(scan)/Products");
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-pageBg px-6">
        <Text className="font-publicSansRegular text-base text-[#64748B]">
          Loading camera permissions...
        </Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg px-6" edges={["bottom"]}>
        <View className="mt-16 rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8">
          <Text className="font-publicSansBold text-2xl text-[#0F172A]">
            Camera access needed
          </Text>
          <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
            Allow camera permission so Skinalo can capture ingredient label
            photos.
          </Text>
          <PrimaryButton
            text="Allow camera"
            callBack={() => {
              requestPermission();
            }}
          />
          <PrimaryButton
            text="Back"
            callBack={() => {
              router.back();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={isTorchEnabled}
      />

      <View
        pointerEvents="none"
        className="absolute bottom-0 left-0 right-0 top-0 bg-[rgba(2,6,23,0.45)]"
      />

      <SafeAreaView className="absolute left-0 right-0 top-0" edges={["top"]}>
        <View className="mt-3 flex-row items-center justify-between px-6">
          <Pressable
            onPress={() => {
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
            className="h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(15,23,42,0.5)]"
          >
            <Ionicons name="close" size={26} color="#F8FAFC" />
          </Pressable>

          <View className="h-11 min-w-[190px] items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(15,23,42,0.5)] px-5">
            <Text className="font-publicSansSemiBold text-lg tracking-[0.8px] text-white">
              INGREDIENT SCANNER
            </Text>
          </View>

          <Pressable
            onPress={() => {
              setIsTorchEnabled((previous) => !previous);
            }}
            accessibilityRole="button"
            accessibilityLabel={
              isTorchEnabled ? "Turn off flashlight" : "Turn on flashlight"
            }
            className="h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(15,23,42,0.5)]"
          >
            <Ionicons
              name={isTorchEnabled ? "flashlight" : "flashlight-outline"}
              size={21}
              color="#F8FAFC"
            />
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

          <Animated.View
            style={[styles.scanLine, { top: 18 }, scanLineAnimatedStyle]}
          />

          <View style={styles.frameCenterBadge}>
            <Ionicons name="reader-outline" size={24} color="#DBEAFE" />
          </View>
        </View>

        <View className="mt-8 w-full items-center px-6">
          <Text className="text-center font-publicSansBold text-[24px] leading-[44px] text-white">
            Center the ingredient list
          </Text>
          <Text className="mt-1 text-center font-publicSansRegular text-[18px] text-[#D2DAE5]">
            Align the text within the frame for a fast and accurate skin
            analysis
          </Text>

          {capturedImageUri ? (
            <Text className="mt-3 rounded-full bg-[rgba(15,23,42,0.6)] px-4 py-2 font-publicSansSemiBold text-[17px] text-[#BFDBFE]">
              Gallery image ready
            </Text>
          ) : null}
        </View>
      </View>

      <SafeAreaView
        className="absolute bottom-0 left-0 right-0"
        edges={["bottom"]}
      >
        <View className="px-6 pb-4">
          {galleryNotice ? (
            <View className="mb-3 self-center rounded-full bg-[rgba(15,23,42,0.72)] px-4 py-2">
              <Text className="font-publicSansSemiBold text-base text-[#E2E8F0]">
                {galleryNotice}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-end justify-between">
            <View className="w-[86px] items-center">
              <Pressable
                onPress={handleOpenGallery}
                accessibilityRole="button"
                accessibilityLabel="Open gallery"
                className="h-16 w-16 items-center justify-center rounded-full border border-[rgba(255,255,255,0.35)] bg-[rgba(15,23,42,0.72)]"
              >
                <Ionicons name="images-outline" size={27} color="#F8FAFC" />
              </Pressable>
              <Text className="mt-2 font-publicSansSemiBold text-[14px] tracking-[1px] text-[#E2E8F0]">
                GALLERY
              </Text>
            </View>

            <Pressable
              onPress={handleCapturePhoto}
              disabled={isCapturing}
              accessibilityRole="button"
              accessibilityLabel="Capture photo"
              className={`h-[94px] w-[94px] items-center justify-center rounded-full border-[5px] border-[#F8FAFC] bg-[rgba(15,23,42,0.38)] ${
                isCapturing ? "opacity-70" : ""
              }`}
            >
              <View className="h-[72px] w-[72px] rounded-full bg-[#F8FAFC]" />
            </Pressable>

            <View className="w-[86px]" />
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
  scanLine: {
    backgroundColor: "#2E8CFF",
    borderRadius: 999,
    height: 4,
    left: 18,
    position: "absolute",
    right: 18,
    shadowColor: "#2E8CFF",
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
