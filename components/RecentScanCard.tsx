import type { ProductCategory } from "@/types/productCategory";
import { Image, Text, View, type ImageSourcePropType } from "react-native";

export type RecentScan = {
  id: string;
  productImage: ImageSourcePropType;
  productName: string;
  productCategory: ProductCategory;
  date: string;
  scanScore: number;
};

type RecentScanCardProps = {
  scan: RecentScan;
};

function getScoreColor(score: number) {
  if (score >= 80) return "#4D956B";
  if (score >= 60) return "#E69A00";
  return "#E85D4B";
}

function breakAfterTwoWords(value: string) {
  const words = value.trim().split(/\s+/);
  if (words.length <= 2) return value.trim();
  return `${words.slice(0, 2).join(" ")}\n${words.slice(2).join(" ")}`;
}

export default function RecentScanCard({ scan }: RecentScanCardProps) {
  const scoreColor = getScoreColor(scan.scanScore);
  const formattedProductName = breakAfterTwoWords(scan.productName);

  return (
    <View className="w-full rounded-[24px] h-32 items-center justify-center border border-[#E6ECE8] bg-white px-4 py-4">
      <View className="flex-row items-center gap-3">
        <Image
          source={scan.productImage}
          className="h-20 w-20 rounded-2xl"
          resizeMode="cover"
        />

        <View className="flex-1">
          <Text className="font-publicSansBold text-[12px] uppercase tracking-[1px] text-[#6A9B75]">
            {scan.productCategory}
          </Text>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="mt-0.5 font-publicSansBold text-xl leading-6 text-[#1E293B]"
            style={{ maxWidth: 220 }}
          >
            {formattedProductName}
          </Text>
          <Text className="mt-1 font-publicSansSemiBold text-sm text-[#94A3B8]">
            {scan.date}
          </Text>
        </View>

        <View
          className="h-16 w-16 items-center justify-center rounded-full border-[5px]"
          style={{ borderColor: scoreColor }}
        >
          <Text
            className="font-publicSansBold text-base"
            style={{ color: scoreColor }}
          >
            {scan.scanScore}
          </Text>
        </View>
      </View>
    </View>
  );
}
