import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useScan } from "../../context/ScanProvider";
import PrimaryButton from "@/components/PrimaryButton";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_DETAILS,
  type ProductCategory,
  type ProductCategoryIconName,
} from "@/types/productCategory";

type CategoryCardProps = {
  category: ProductCategory;
  subtitle: string;
  iconName: ProductCategoryIconName;
  isSelected: boolean;
  onSelect: (category: ProductCategory) => void;
};

const CategoryCard = memo(function CategoryCard({
  category,
  subtitle,
  iconName,
  isSelected,
  onSelect,
}: CategoryCardProps) {
  const pressScale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    onSelect(category);
  }, [category, onSelect]);

  const animateScale = (toValue: number) => {
    pressScale.stopAnimation();
    Animated.spring(pressScale, {
      toValue,
      friction: 9,
      tension: 170,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => animateScale(0.975)}
      onPressOut={() => animateScale(1)}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${category}. ${subtitle}`}
      className="mb-4 w-[48%]"
      style={{ borderRadius: 18 }}
      android_ripple={{ color: "rgba(45, 106, 79, 0.08)", borderless: false }}
    >
      <Animated.View
        className="rounded-[18px] border px-[16px] pb-[16px] pt-[20px]"
        style={{
          borderColor: isSelected ? "#2D6A4F" : "#E2E8F0",
          backgroundColor: isSelected ? "#2D6A4F" : "#FFFFFF",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 2,
          transform: [{ scale: pressScale }],
        }}
      >
        <Animated.View
          className="h-11 w-11 items-center justify-center rounded-xl"
          style={{
            backgroundColor: isSelected
              ? "rgba(255, 255, 255, 0.2)"
              : "#E9EFED",
          }}
        >
          <Ionicons
            name={iconName}
            size={20}
            color={isSelected ? "#ECFDF5" : "#2D6A4F"}
          />
        </Animated.View>

        <Text
          className="mt-4 font-publicSansBold text-[17px] leading-6"
          style={{ color: isSelected ? "#ECFDF5" : "#111827" }}
        >
          {category}
        </Text>

        <Text
          className="mt-1 font-publicSansRegular text-sm leading-5"
          style={{ color: isSelected ? "#BFE3D3" : "#64748B" }}
        >
          {subtitle}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedCategory, setSelectedCategory } = useScan();

  const handleSelectCategory = useCallback((category: ProductCategory) => {
    setSelectedCategory(category);
  }, [setSelectedCategory]);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return PRODUCT_CATEGORIES;
    }

    return PRODUCT_CATEGORIES.filter((category) =>
      category.toLowerCase().includes(normalizedQuery),
    );
  }, [searchQuery]);

  return (
    <SafeAreaView
      className="flex-1 bg-pageBg"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        className="flex-1 bg-pageBg"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 10,
          paddingBottom: 28,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-publicSansBold text-[38px] pt-5 leading-[52px] text-[#0F172A]">
          Select Product Type
        </Text>
        <Text className="mt-2 font-publicSansRegular text-lg leading-7 text-[#64748B]">
          Help our AI calibrate by choosing the category that best matches your
          product.
        </Text>

        <View className="mt-7 h-[58px] flex-row items-center rounded-2xl border border-[#D8DEE4] bg-white px-4">
          <Ionicons name="search-outline" size={22} color="#64748B" />
          <TextInput
            className="ml-3 flex-1 font-publicSansRegular text-lg text-[#1E293B]"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search product categories..."
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search product categories"
            returnKeyType="search"
          />
        </View>

        {filteredCategories.length === 0 ? (
          <View className="mt-8 rounded-3xl border border-[#E2E8F0] bg-white px-5 py-7">
            <Text className="font-publicSansBold text-xl text-[#0F172A]">
              No matching categories
            </Text>
            <Text className="mt-2 font-publicSansRegular text-base leading-6 text-[#64748B]">
              Try a different keyword to find your product type.
            </Text>
          </View>
        ) : (
          <View className="mt-8 flex-row flex-wrap justify-between">
            {filteredCategories.map((category) => {
              const categoryDetail = PRODUCT_CATEGORY_DETAILS[category];
              const isSelected = selectedCategory === category;

              return (
                <CategoryCard
                  key={category}
                  category={category}
                  subtitle={categoryDetail.subtitle}
                  iconName={categoryDetail.iconName}
                  isSelected={isSelected}
                  onSelect={handleSelectCategory}
                />
              );
            })}
          </View>
        )}

        <View className="relative mt-4 mb-6 overflow-hidden rounded-3xl bg-[#D6E8E5] px-5 py-6">
          <View className="absolute right-0 top-0 rounded-bl-xl rounded-tr-3xl bg-[#5B21B6] px-3 py-1">
            <Text className="font-publicSansBold text-xs text-white">Pro</Text>
          </View>

          <View className="flex-row h-24 items-center justify-between">
            <View className="mr-5 flex-1">
              <Text className="font-publicSansBold text-[20px] leading-8 text-[#1E293B]">
                Not sure?
              </Text>
              <Text className="mt-1 font-publicSansRegular text-base leading-6 text-[#64748B]">
                Scan the barcode and we&apos;ll identify it for you.
              </Text>
            </View>

            <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#EAF8F2]">
              <Ionicons name="barcode-outline" size={28} color="#10B981" />
            </View>
          </View>
        </View>

        <PrimaryButton
          text="Continue to scan"
          disabled={!selectedCategory}
          callBack={() => {
            router.push("/(scan)/ScanInstructions");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
