import {
  CameraView,
  type BarcodeScanningResult,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScan } from "../../context/ScanProvider";
import PrimaryButton from "@/components/PrimaryButton";

export default function Scanner() {
  const { selectedCategory } = useScan();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    setHasScanned(true);
    setLastScannedCode(result.data);
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
            Allow camera permission so Skinalo can scan product barcodes.
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
        className="flex-1"
        facing="back"
        onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
      />

      <SafeAreaView className="absolute left-0 right-0 top-0" edges={["top"]}>
        <View className="mx-5 mt-2 rounded-2xl bg-[rgba(15,23,42,0.7)] px-4 py-3">
          <Text className="font-publicSansSemiBold text-sm text-[#BFE3D3]">
            Category
          </Text>
          <Text className="mt-1 font-publicSansBold text-lg text-white">
            {selectedCategory}
          </Text>
        </View>
      </SafeAreaView>

      <SafeAreaView
        className="absolute bottom-0 left-0 right-0"
        edges={["bottom"]}
      >
        <View className="mx-5 mb-3 rounded-2xl bg-[rgba(15,23,42,0.75)] px-4 py-4">
          <Text className="font-publicSansRegular text-base text-white">
            {lastScannedCode
              ? `Scanned code: ${lastScannedCode}`
              : "Align the barcode inside camera view."}
          </Text>

          {hasScanned ? (
            <Pressable
              onPress={() => {
                setHasScanned(false);
                setLastScannedCode(null);
              }}
              accessibilityRole="button"
              accessibilityLabel="Scan another barcode"
              className="mt-3 h-12 items-center justify-center rounded-full bg-[#2D6A4F]"
            >
              <Text className="font-publicSansBold text-base text-white">
                Scan again
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
