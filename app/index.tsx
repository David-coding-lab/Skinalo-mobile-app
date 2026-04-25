import LocalRecommendationCarousel from "@/components/LocalRecommendationCarousel";
import PremiumFeatureCarousel from "@/components/PremiumFeatureCarousel";
import RecentScanCard, { type RecentScan } from "@/components/RecentScanCard";
import BottomNav, { BOTTOM_NAV_HEIGHT, type BottomNavItem } from "@/components/BottomNav";
import { useAuth } from "@/context/AuthProvider";
import type { LocalProductRecommendation } from "@/types/localProductRecommendation";
import type { PremiumFeature } from "@/types/premiumFeature";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import {
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Index() {
  const { user, loading } = useAuth();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const pathname = usePathname();

  const toneKey = String(user?.prefs?.skinTone || "").toLowerCase();
  const toneMap: Record<string, { label: string; color: string }> = {
    fair: { label: "Fair", color: "#F3D9C1" },
    light: { label: "Light", color: "#F9EBE0" },
    olive: { label: "Olive", color: "#A57144" },
    medium: { label: "Medium", color: "#E1B183" },
    deep: { label: "Deep", color: "#7D4E2E" },
    darkest: { label: "Darkest", color: "#312529" },
  };

  const tone = toneMap[toneKey] || { label: "Not set", color: "#D9D9D9" };
  const skinCondition = String(user?.prefs?.skinFeel || "").trim();
  const locationValue = String(user?.prefs?.location || "").trim();
  const countryFromPrefs = locationValue.includes(",")
    ? locationValue.split(",").pop()?.trim() || ""
    : locationValue;
  const premiumFeatures: PremiumFeature[] = [
    {
      id: "premium-1",
      name: "Alowear",
      tags: "Holistic Products Sync • Skincare Products",
      status: "start-plan",
      ctaLabel: "Start Plan",
      iconName: "people",
      imageLayout: "single",
      primaryImage: require("../assets/images/alowear-heroimg.png"),
    },
    {
      id: "premium-2",
      name: "Beautify: Your AI Skin Coach",
      tags: "Coming Soon • Smooth Skin • Lighten Up",
      status: "coming-soon",
      ctaLabel: "Learn More",
      iconName: "sparkles",
      imageLayout: "single",
      primaryImage: require("../assets/images/beautify-heroimg.png"),
    },
    {
      id: "premium-3",
      name: "Skinalo Community",
      tags: "Coming Soon • Connect • See Transformation",
      status: "coming-soon",
      ctaLabel: "Learn More",
      iconName: "people-circle",
      imageLayout: "split",
      primaryImage: require("../assets/images/community-day1-img.png"),
      secondaryImage: require("../assets/images/community-day30-img.png"),
      primaryImageLabel: "Day 1",
      secondaryImageLabel: "Day 30",
    },
  ];

  const recentScans: RecentScan[] = [
    {
      id: "scan-1",
      productImage: {
        uri: "https://picsum.photos/seed/skinalo-body-cream/120/120",
      },
      productCategory: "Cleansers",
      productName: "Hydrating Facial Cleanser",
      date: "Checked 2h ago",
      scanScore: 92,
    },
    {
      id: "scan-2",
      productImage: {
        uri: "https://picsum.photos/seed/skinalo-face-cream/120/120",
      },
      productCategory: "Treatments",
      productName: "Retinol 0.5% in Squalane",
      date: "Checked yesterday",
      scanScore: 65,
    },
    {
      id: "scan-3",
      productImage: {
        uri: "https://picsum.photos/seed/skinalo-soap/120/120",
      },
      productCategory: "Moisturizers",
      productName: "Moisturizing Cream",
      date: "Checked 3 days ago",
      scanScore: 88,
    },
  ];

  const todaySkinTip = {
    title: "The Importance of Vitamin C",
    description:
      "Vitamin C brightens skin, fights aging, and helps protect against sun damage.",
  };

  const localRecommendations: LocalProductRecommendation[] = [
    {
      id: "local-1",
      productName: "Verdant Botanics",
      description: "Hydrating body cream for smooth, nourished skin.",
      productImage: require("../assets/images/Verdant Botanics.png"),
      productTag: "Cream",
    },
    {
      id: "local-2",
      productName: "Mist & Clay",
      description: "Gentle face wash that cleanses without stripping moisture.",
      productImage: require("../assets/images/Mist & Clay.png"),
      productTag: "Face Wash",
    },
  ];

  const bottomNavItems: BottomNavItem[] = [
    {
      key: "home",
      label: "Home",
      icon: "home",
      isActive: pathname === "/",
      onPress: () => router.replace("/"),
    },
    {
      key: "scan",
      label: "Scan",
      icon: "scan",
      isActive: pathname.includes("/(scan)") || pathname.startsWith("/scan"),
      onPress: () => router.replace("/(scan)/Products"),
    },
    {
      key: "history",
      label: "History",
      icon: "time",
      isActive: pathname.startsWith("/history"),
      disabledHint: "History tab is coming soon",
    },
    {
      key: "profile",
      label: "Profile",
      icon: "happy",
      isActive: pathname.startsWith("/profile"),
      disabledHint: "Profile tab is coming soon",
    },
  ];

  // Guard to prevent any rendering of the home content while we are still loading/redirecting
  if (loading || !user) return null;

  return (
    <SafeAreaView className="flex-1 bg-pageBg">
      <View className="flex-1">
        <ScrollView
          className="w-full"
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: BOTTOM_NAV_HEIGHT + 46 + bottomInset,
          }}
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          overScrollMode="never"
        >
          <ImageBackground
            className="w-full h-[400px] shrink-0"
            source={require("../assets/images/dashboard-hero-img.png")}
          >
            <View className="mt-10 flex-row items-center justify-between px-4">
              <View
                className="rounded-full w-16 h-16 items-center justify-center"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={34}
                  color="#2D6A4F"
                />
              </View>

              <Image source={require("../assets/images/text-logo.png")} />

              <View
                className="rounded-full w-16 h-16 items-center justify-center"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
              >
                <Ionicons name="sparkles-outline" size={26} color="#2D6A4F" />
              </View>
            </View>

            <View
              className="w-[232px] h-[68px] mt-auto mb-10 self-center rounded-[28px]"
              style={{
                shadowColor: "#E5E4E2",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                className="flex-1 rounded-[28px] overflow-hidden"
                onPress={() => {
                  router.push("/Products");
                }}
                accessibilityRole="button"
                accessibilityLabel="Scan a product"
              >
                <BlurView
                  intensity={28}
                  tint="light"
                  experimentalBlurMethod={
                    Platform.OS === "android" ? "dimezisBlurView" : undefined
                  }
                  className="flex-1"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <View className="flex-1 flex-row items-center justify-center gap-3">
                    <View
                      className="rounded-full w-9 h-9 items-center justify-center"
                      style={{
                        borderWidth: 1,
                        borderColor: "#2D6A4F",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <Ionicons
                        name="qr-code-outline"
                        size={20}
                        color="#2D6A4F"
                      />
                    </View>
                    <Text className="text-[#1E293B] text-lg font-publicSansBold">
                      Scan product
                    </Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          {/* my skin profile */}

          <View className="w-full px-5 justify-start gap-12">
            <Text className="font-publicSansBold text-[rgba(255, 255, 255, 0.3)] mt-8 text-md tracking-[1.2px]">
              MY SKIN PROFILE
            </Text>

            <View className="mr-10 w-full rounded-3xl border border-[#E6ECE8] bg-white px-5 py-5">
              <View className="flex-row items-center gap-6">
                <View className="relative">
                  <View
                    className="h-14 w-14 rounded-full border border-[#D4DBD6]"
                    style={{ backgroundColor: tone.color }}
                  />
                  <View className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-[#22C55E]" />
                </View>

                <View>
                  <Text className="font-publicSansBold text-[11px] tracking-[1px] text-[#94A3B8]">
                    SKIN TONE
                  </Text>
                  <Text className="mt-1 font-publicSansBold text-lg text-[#1D2A22]">
                    {tone.label}
                  </Text>
                </View>

                <View className="h-[100%] w-[1.5px] ml-24 bg-[#EFF3F0]" />

                <View className="items-center ml-auto justify-between gap-2">
                  <Text className="mt-1 font-publicSansBold text-textLightGray text-sm">
                    CONDITION
                  </Text>

                  <View className="rounded-full items-center justify-center border border-lightPrimaryOpacity2 bg-lightPrimaryOpacity px-4 py-4">
                    <Text className="font-publicSansBold text-xs uppercase text-primary">
                      {skinCondition || "Pending"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-8 w-full px-5 pb-8">
            <View className="flex-row w-full items-center justify-between px-1">
              <Text className="font-publicSansBold text-xl">
                Recent Analysis
              </Text>
              <Text className="text-lightBlue font-publicSansSemiBold text-md">
                VIEW ALL({recentScans.length})
              </Text>
            </View>

            <View className="mt-4 gap-4">
              {recentScans.map((scan) => (
                <RecentScanCard key={scan.id} scan={scan} />
              ))}
            </View>
          </View>

          <PremiumFeatureCarousel features={premiumFeatures} />

          <View className="mt-8 w-full px-5 pb-12">
            <Text className="font-publicSansBold text-xl text-textDark">
              Today&apos;s Skin Tip
            </Text>

            <View
              accessible
              accessibilityRole="text"
              accessibilityLabel={`${todaySkinTip.title}. ${todaySkinTip.description}`}
              className="mt-4 flex-row items-center gap-4 rounded-2xl border border-[#E6ECE8] bg-white px-5 py-6"
            >
              <View className="h-[78px] w-[78px] items-center justify-center rounded-2xl bg-[#F2F5F3]">
                <Ionicons name="sunny-outline" size={35} color="#82CBAA" />
              </View>

              <View className="flex-1">
                <Text className="font-publicSansBold text-xl text-textDark">
                  {todaySkinTip.title}
                </Text>
                <Text className="mt-1 font-publicSansRegular text-base leading-7 text-textGray">
                  {todaySkinTip.description}
                </Text>
              </View>
            </View>
          </View>

          <LocalRecommendationCarousel
            recommendations={localRecommendations}
            country={countryFromPrefs}
          />
        </ScrollView>
        <BottomNav items={bottomNavItems} />
      </View>
    </SafeAreaView>
  );
}
