import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const BOTTOM_NAV_HEIGHT = 86;

export type BottomNavItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  isActive: boolean;
  onPress?: () => void;
  disabledHint?: string;
};

type BottomNavProps = {
  items: BottomNavItem[];
  width?: number;
};

export default function BottomNav({ items, width = 380 }: BottomNavProps) {
  const { bottom: bottomInset } = useSafeAreaInsets();

  return (
    <View
      className="absolute self-center rounded-[36px] px-4"
      style={{
        width,
        height: BOTTOM_NAV_HEIGHT,
        bottom: Math.max(bottomInset, 10),
        backgroundColor: "#EEF3F8",
        borderColor: "#CBD5E1",
        borderWidth: 1,
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 20,
      }}
    >
      <View
        className="h-full flex-row items-center justify-center"
        style={{ gap: 20 }}
      >
        {items.map((item) => {
          const isDisabled = item.isActive || !item.onPress;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityHint={
                item.isActive
                  ? `${item.label} tab is already active`
                  : isDisabled
                    ? (item.disabledHint ?? `${item.label} tab is coming soon`)
                    : `Go to ${item.label}`
              }
              accessibilityState={{
                selected: item.isActive,
                disabled: isDisabled,
              }}
              onPress={isDisabled ? undefined : item.onPress}
              disabled={isDisabled}
              className="w-[72px] items-center"
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={item.isActive ? "#2D6A4F" : "#8FA1B3"}
              />
              <Text
                className="mt-1 font-publicSansSemiBold text-xs"
                style={{ color: item.isActive ? "#2D6A4F" : "#8FA1B3" }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
