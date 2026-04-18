import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScan } from "../../context/ScanProvider";

type TipConfig = {
  title: string;
  description: string;
  iconName: ComponentProps<typeof Ionicons>["name"];
};

const SCAN_TIPS: TipConfig[] = [
  {
    title: "Use Good Lighting",
    description: "Ensure the bottle is clearly illuminated without glare",
    iconName: "bulb-outline",
  },
  {
    title: "Hold Steady",
    description: "Keep your device still for a sharp, clear image",
    iconName: "phone-portrait-outline",
  },
  {
    title: "Capture the Full List",
    description: "Make sure all ingredients are within the scan frame",
    iconName: "scan-outline",
  },
];

export default function ScanInstructions() {
  const { selectedCategory } = useScan();

  if (!selectedCategory) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg px-6" edges={["bottom"]}>
        <View className="mt-16 rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8">
          <Text className="font-publicSansBold text-2xl text-[#0F172A]">
            Pick a category first
          </Text>
          <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
            Select a product type on the previous page so scanning can use the
            right category context.
          </Text>
          <Pressable
            onPress={() => {
              router.replace("/(scan)/Products");
            }}
            accessibilityRole="button"
            accessibilityLabel="Back to categories"
            className="mt-8 h-14 items-center justify-center rounded-2xl bg-primary"
          >
            <Text className="font-publicSansSemiBold text-xl text-white">
              Back to categories
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-pageBg"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 18,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../assets/images/scan-instructions-hero.png")}
          resizeMode="cover"
          className="h-[360px] w-full rounded-[22px]"
          accessibilityIgnoresInvertColors
        />

        <Text className="mt-7 font-publicSansBold text-[28px] leading-[52px] text-[#0F172A]">
          Scanning Tips for Best Results
        </Text>
        <Text className="mt-2 font-publicSansRegular text-xl leading-7 text-[#64748B]">
          Follow these simple steps for an accurate analysis of your skincare
          products.
        </Text>

        <View className="mt-8 gap-4">
          {SCAN_TIPS.map((tip) => (
            <View
              key={tip.title}
              className="flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-5 h-28"
            >
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#E9EFED]">
                <Ionicons name={tip.iconName} size={23} color="#2D6A4F" />
              </View>

              <View className="ml-4 flex-1">
                <Text className="font-publicSansBold text-[17px] leading-6 text-[#0F172A]">
                  {tip.title}
                </Text>
                <Text className="mt-1 font-publicSansRegular text-base leading-6 text-[#64748B]">
                  {tip.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="border-t border-[#E2E8F0] bg-pageBg px-6 pb-6 pt-5">
        <Pressable
          onPress={() => {
            router.push("/(scan)/Scanner");
          }}
          accessibilityRole="button"
          accessibilityLabel="Start scanning"
          className="h-14 flex-row items-center justify-center rounded-2xl bg-primary"
        >
          <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
          <Text className="ml-2 font-publicSansSemiBold text-lg text-white">
            Start Scanning
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            router.push("/(scan)/ManualInput");
          }}
          accessibilityRole="button"
          accessibilityLabel="Input manually"
          className="mt-4 h-14 items-center justify-center rounded-2xl border-2 border-[#D6DCE3] bg-white"
        >
          <Text className="font-publicSansSemiBold text-lg text-[#111827]">
            Input Manually
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
