import { Image, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import type { PremiumFeature } from "@/types/premiumFeature";

type PremiumFeatureCardProps = {
  feature: PremiumFeature;
  width: number;
};

type FeatureIconProps = {
  featureId: string;
  color: string;
};

function FeatureIcon({ featureId, color }: FeatureIconProps) {
  if (featureId === "premium-2") {
    return (
      <Svg width={15} height={21} viewBox="0 0 21 21" fill="none">
        <Path
          d="M10 1C10.65 1 11.3167 1.07083 12 1.2125C12.6833 1.35417 13.35 1.56667 14 1.85L11.25 3.125C11.05 3.09167 10.8458 3.0625 10.6375 3.0375C10.4292 3.0125 10.2167 3 10 3C9.76667 3 9.54167 3.00833 9.325 3.025C9.10833 3.04167 8.88333 3.075 8.65 3.125C9.35 4.29167 10.3 5.22917 11.5 5.9375C12.7 6.64583 14.0333 7 15.5 7C15.5667 7 15.625 7 15.675 7C15.725 7 15.7833 7 15.85 7L16.725 8.925C15.225 9.10833 13.6583 8.93333 12.025 8.4C10.3917 7.86667 8.96667 6.83333 7.75 5.3C7.16667 6.71667 6.37083 7.88333 5.3625 8.8C4.35417 9.71667 3.23333 10.4 2 10.85C2 13.1667 2.77917 15.1042 4.3375 16.6625C5.89583 18.2208 7.78333 19 10 19C12.2667 19 14.175 18.2 15.725 16.6C17.275 15 18.0333 13.1333 18 11C18 10.7667 17.9917 10.5625 17.975 10.3875C17.9583 10.2125 17.9333 10 17.9 9.75L19.15 6.975C19.45 7.675 19.6667 8.35 19.8 9C19.9333 9.65 20 10.3167 20 11C20 12.3333 19.7458 13.6042 19.2375 14.8125C18.7292 16.0208 18.0292 17.0833 17.1375 18C16.2458 18.9167 15.1917 19.6458 13.975 20.1875C12.7583 20.7292 11.4333 21 10 21C8.63333 21 7.34167 20.7375 6.125 20.2125C4.90833 19.6875 3.84583 18.9708 2.9375 18.0625C2.02917 17.1542 1.3125 16.0917 0.7875 14.875C0.2625 13.6583 0 12.3667 0 11C0 9.56667 0.275 8.2375 0.825 7.0125C1.375 5.7875 2.1125 4.72917 3.0375 3.8375C3.9625 2.94583 5.025 2.25 6.225 1.75C7.425 1.25 8.68333 1 10 1V1M7 10.75C7.35 10.75 7.64583 10.8708 7.8875 11.1125C8.12917 11.3542 8.25 11.65 8.25 12C8.25 12.35 8.12917 12.6458 7.8875 12.8875C7.64583 13.1292 7.35 13.25 7 13.25C6.65 13.25 6.35417 13.1292 6.1125 12.8875C5.87083 12.6458 5.75 12.35 5.75 12C5.75 11.65 5.87083 11.3542 6.1125 11.1125C6.35417 10.8708 6.65 10.75 7 10.75V10.75M12.325 5V5V5V5V5V5V5V5V5V5V5V5V5M13 10.75C13.35 10.75 13.6458 10.8708 13.8875 11.1125C14.1292 11.3542 14.25 11.65 14.25 12C14.25 12.35 14.1292 12.6458 13.8875 12.8875C13.6458 13.1292 13.35 13.25 13 13.25C12.65 13.25 12.3542 13.1292 12.1125 12.8875C11.8708 12.6458 11.75 12.35 11.75 12C11.75 11.65 11.8708 11.3542 12.1125 11.1125C12.3542 10.8708 12.65 10.75 13 10.75V10.75M17.5 0L18.6 2.4L21 3.5L18.6 4.6L17.5 7L16.4 4.6L14 3.5L16.4 2.4L17.5 0V0M2.425 8.475C3.275 7.99167 4.01667 7.36667 4.65 6.6C5.28333 5.83333 5.75833 4.975 6.075 4.025C5.225 4.50833 4.48333 5.13333 3.85 5.9C3.21667 6.66667 2.74167 7.525 2.425 8.475V8.475M6.075 4.025V4.025V4.025V4.025V4.025V4.025"
          fill={color}
        />
      </Svg>
    );
  }

  if (featureId === "premium-3") {
    return (
      <Svg width={22} height={16} viewBox="0 0 22 16" fill="none">
        <Path
          d="M7.62939e-06 16V12C7.62939e-06 11.4333 0.195841 10.9583 0.587508 10.575C0.979174 10.1917 1.45001 10 2.00001 10H5.27501C5.60834 10 5.92501 10.0833 6.22501 10.25C6.52501 10.4167 6.76667 10.6417 6.95001 10.925C7.43334 11.575 8.02917 12.0833 8.73751 12.45C9.44584 12.8167 10.2 13 11 13C11.8167 13 12.5792 12.8167 13.2875 12.45C13.9958 12.0833 14.5833 11.575 15.05 10.925C15.2667 10.6417 15.5208 10.4167 15.8125 10.25C16.1042 10.0833 16.4083 10 16.725 10H20C20.5667 10 21.0417 10.1917 21.425 10.575C21.8083 10.9583 22 11.4333 22 12V16H15V13.725C14.4167 14.1417 13.7875 14.4583 13.1125 14.675C12.4375 14.8917 11.7333 15 11 15C10.2833 15 9.58334 14.8875 8.90001 14.6625C8.21667 14.4375 7.58334 14.1167 7.00001 13.7V16H7.62939e-06V16M11 12C10.3667 12 9.76667 11.8542 9.20001 11.5625C8.63334 11.2708 8.15834 10.8667 7.77501 10.35C7.49167 9.93333 7.13751 9.60417 6.71251 9.3625C6.28751 9.12083 5.82501 9 5.32501 9C5.69167 8.38333 6.46667 7.89583 7.65001 7.5375C8.83334 7.17917 9.95001 7 11 7C12.05 7 13.1667 7.17917 14.35 7.5375C15.5333 7.89583 16.3083 8.38333 16.675 9C16.1917 9 15.7333 9.12083 15.3 9.3625C14.8667 9.60417 14.5083 9.93333 14.225 10.35C13.8583 10.8833 13.3917 11.2917 12.825 11.575C12.2583 11.8583 11.65 12 11 12V12M3.00001 9C2.16667 9 1.45834 8.70833 0.875008 8.125C0.291674 7.54167 7.62939e-06 6.83333 7.62939e-06 6C7.62939e-06 5.15 0.291674 4.4375 0.875008 3.8625C1.45834 3.2875 2.16667 3 3.00001 3C3.85001 3 4.56251 3.2875 5.13751 3.8625C5.71251 4.4375 6.00001 5.15 6.00001 6C6.00001 6.83333 5.71251 7.54167 5.13751 8.125C4.56251 8.70833 3.85001 9 3.00001 9V9M19 9C18.1667 9 17.4583 8.70833 16.875 8.125C16.2917 7.54167 16 6.83333 16 6C16 5.15 16.2917 4.4375 16.875 3.8625C17.4583 3.2875 18.1667 3 19 3C19.85 3 20.5625 3.2875 21.1375 3.8625C21.7125 4.4375 22 5.15 22 6C22 6.83333 21.7125 7.54167 21.1375 8.125C20.5625 8.70833 19.85 9 19 9V9M11 6C10.1667 6 9.45834 5.70833 8.87501 5.125C8.29167 4.54167 8.00001 3.83333 8.00001 3C8.00001 2.15 8.29167 1.4375 8.87501 0.8625C9.45834 0.2875 10.1667 0 11 0C11.85 0 12.5625 0.2875 13.1375 0.8625C13.7125 1.4375 14 2.15 14 3C14 3.83333 13.7125 4.54167 13.1375 5.125C12.5625 5.70833 11.85 6 11 6V6"
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.1538 5.26918L16.3195 3.46888L14.5192 2.63459L16.3195 1.8003L17.1538 0L17.9881 1.8003L19.7884 2.63459L17.9881 3.46888L17.1538 5.26918V5.26918M5.9038 5.26918L5.06952 3.46888L3.26921 2.63459L5.06952 1.8003L5.9038 0L6.73809 1.8003L8.53839 2.63459L6.73809 3.46888L5.9038 5.26918V5.26918M17.1538 16.5192L16.3195 14.7189L14.5192 13.8846L16.3195 13.0503L17.1538 11.25L17.9881 13.0503L19.7884 13.8846L17.9881 14.7189L17.1538 16.5192V16.5192M2.52303 19.5268L0.261536 17.2653C0.0871785 17.0888 0 16.8754 0 16.6252C0 16.375 0.0871785 16.1628 0.261536 15.9884L10.8923 5.37693C11.0689 5.20257 11.2822 5.11539 11.5324 5.11539C11.7826 5.11539 11.9948 5.20257 12.1692 5.37693L14.4307 7.63843C14.605 7.81501 14.6922 8.02839 14.6922 8.27855C14.6922 8.52872 14.605 8.74098 14.4307 8.91534L3.79995 19.5268C3.62336 19.7012 3.40998 19.7884 3.15982 19.7884C2.90965 19.7884 2.69739 19.7012 2.52303 19.5268V19.5268M3.17687 18.0423L10.3461 10.8423L8.94611 9.44227L1.74611 16.6115L3.17687 18.0423V18.0423"
        fill={color}
      />
    </Svg>
  );
}

export default function PremiumFeatureCard({
  feature,
  width,
}: PremiumFeatureCardProps) {
  const isComingSoon = feature.status === "coming-soon";
  const cardStyle = {
    width,
    borderColor: isComingSoon ? "rgba(143, 0, 255, 0.2)" : "#F2F2F2",
    backgroundColor: isComingSoon ? "rgba(255, 255, 255, 0.93)" : "#FFFFFF",
  };
  const iconWrapStyle = {
    backgroundColor: isComingSoon
      ? "rgba(143, 0, 255, 0.12)"
      : "rgba(238, 241, 242, 0.95)",
  };
  const mediaWrapStyle = isComingSoon
    ? {
        borderColor: "rgba(143, 0, 255, 0.22)",
        backgroundColor: "rgba(143, 0, 255, 0.06)",
      }
    : undefined;
  const ctaStyle = {
    backgroundColor: isComingSoon ? "rgba(143, 0, 255, 0.45)" : "#8F00FF",
  };

  return (
    <View className="rounded-2xl border px-3 py-3" style={cardStyle}>
      <View className="flex-row items-center gap-2.5">
        <View
          className="h-14 w-14 items-center justify-center rounded-[10px]"
          style={iconWrapStyle}
        >
          <FeatureIcon
            featureId={feature.id}
            color={isComingSoon ? "#7A1CD6" : "#8F00FF"}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text
            numberOfLines={1}
            className="font-publicSansBold text-[18px] leading-5"
            style={{ color: isComingSoon ? "#1E293B" : "#0F172A" }}
          >
            {feature.name}
          </Text>
          <Text
            numberOfLines={1}
            className="mt-0.5 font-publicSansSemiBold text-sm leading-4"
            style={{ color: isComingSoon ? "#475569" : "#334155" }}
          >
            {feature.tags}
          </Text>
        </View>
      </View>

      <View
        className="mt-3 overflow-hidden rounded-xl border border-[#E6E8EE] bg-[#F8FAFC]"
        style={mediaWrapStyle}
      >
        {feature.imageLayout === "split" && feature.secondaryImage ? (
          <View className="flex-row gap-1.5 p-1.5">
            <View className="relative flex-1 overflow-hidden rounded-xl">
              <Image
                source={feature.primaryImage}
                className="h-[220px] w-full"
                resizeMode="cover"
              />
              {feature.primaryImageLabel ? (
                <View className="absolute bottom-2 left-2 rounded-full bg-[rgba(15,23,42,0.55)] px-2 py-1">
                  <Text className="font-publicSansSemiBold text-xs leading-3 text-white">
                    {feature.primaryImageLabel}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="relative flex-1 overflow-hidden rounded-xl">
              <Image
                source={feature.secondaryImage}
                className="h-[220px] w-full"
                resizeMode="cover"
              />
              {feature.secondaryImageLabel ? (
                <View className="absolute bottom-2 left-2 rounded-full bg-[rgba(15,23,42,0.55)] px-2 py-1">
                  <Text className="font-publicSansSemiBold text-xs leading-3 text-white">
                    {feature.secondaryImageLabel}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <Image
            source={feature.primaryImage}
            className="h-[220px] w-full"
            resizeMode="cover"
          />
        )}
      </View>

      <TouchableOpacity
        activeOpacity={isComingSoon ? 1 : 0.88}
        disabled={isComingSoon}
        className="mt-3 min-h-14 items-center justify-center rounded-[10px]"
        style={ctaStyle}
      >
        <Text
          className="font-publicSansBold text-[16px] leading-5"
          style={{
            color: isComingSoon ? "rgba(255, 255, 255, 0.85)" : "#FFFFFF",
          }}
        >
          {feature.ctaLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
