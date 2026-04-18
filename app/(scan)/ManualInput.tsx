import { router } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScan } from "../../context/ScanProvider";
import PrimaryButton from "@/components/PrimaryButton";

export default function ManualInput() {
  const { selectedCategory } = useScan();

  return (
    <SafeAreaView className="flex-1 bg-pageBg px-6" edges={["bottom"]}>
      <View className="mt-10 rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8">
        <Text className="font-publicSansBold text-3xl text-[#0F172A]">
          Manual Input
        </Text>
        <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
          This screen will accept typed product details in the next step.
        </Text>
        <View className="mt-5 rounded-2xl bg-[#EEF3F8] px-4 py-3">
          <Text className="font-publicSansSemiBold text-sm tracking-[0.6px] text-[#2D6A4F]">
            SELECTED CATEGORY
          </Text>
          <Text className="mt-1 font-publicSansBold text-xl text-[#0F172A]">
            {selectedCategory || "Not selected"}
          </Text>
        </View>

        <PrimaryButton
          text="Back to scan options"
          callBack={() => {
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
}
