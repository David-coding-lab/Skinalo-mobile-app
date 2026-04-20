import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScan } from "../../context/ScanProvider";
import PrimaryButton from "@/components/PrimaryButton";

export default function ManualInput() {
  const { selectedCategory, extractedIngredients, extractionError } = useScan();

  return (
    <SafeAreaView className="flex-1 bg-pageBg" edges={["bottom"]}>
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingBottom: 24,
          paddingTop: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-3xl border border-[#E2E8F0] bg-white px-6 py-8">
          <Text className="font-publicSansBold text-3xl text-[#0F172A]">
            Manual Input
          </Text>

          <Text className="mt-3 font-publicSansRegular text-base leading-6 text-[#64748B]">
            Review the extracted ingredients below. In the next step, we will
            let users edit this list manually.
          </Text>

          <View className="mt-5 rounded-2xl bg-[#EEF3F8] px-4 py-3">
            <Text className="font-publicSansSemiBold text-sm tracking-[0.6px] text-[#2D6A4F]">
              SELECTED CATEGORY
            </Text>
            <Text className="mt-1 font-publicSansBold text-xl text-[#0F172A]">
              {selectedCategory || "Not selected"}
            </Text>
          </View>

          <View className="mt-5 rounded-2xl bg-[#F8FAFC] px-4 py-4">
            <Text className="font-publicSansSemiBold text-sm tracking-[0.6px] text-[#2563EB]">
              EXTRACTED INGREDIENTS
            </Text>

            {extractedIngredients.length > 0 ? (
              <View className="mt-3 gap-2">
                {extractedIngredients.map((ingredient, index) => (
                  <Text
                    key={`${ingredient}-${index}`}
                    className="font-publicSansRegular text-base text-[#0F172A]"
                  >
                    {index + 1}. {ingredient}
                  </Text>
                ))}
              </View>
            ) : (
              <Text className="mt-3 font-publicSansRegular text-base text-[#64748B]">
                No ingredients extracted yet. You can continue with manual entry.
              </Text>
            )}
          </View>

          {extractionError ? (
            <View className="mt-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3">
              <Text className="font-publicSansSemiBold text-sm tracking-[0.6px] text-[#B91C1C]">
                EXTRACTION NOTICE
              </Text>
              <Text className="mt-1 font-publicSansRegular text-base leading-6 text-[#7F1D1D]">
                {extractionError}
              </Text>
            </View>
          ) : null}

          <PrimaryButton
            text="Back to scan options"
            callBack={() => {
              router.back();
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
