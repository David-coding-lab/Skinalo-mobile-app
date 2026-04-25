import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

import { ScanProvider } from "../../context/ScanProvider";

export default function ScanLayout() {
  return (
    <ScanProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
          contentStyle: {
            backgroundColor: "#F8FAFC",
          },
          headerStyle: {
            backgroundColor: "#FDFDFB",
          },
          headerTitleStyle: {
            fontFamily: "PublicSansExtraBold",
            fontSize: 24,
            fontWeight: "800",
            color: "#0F172A",
          },
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                style={{ paddingHorizontal: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={22} color="#0F172A" />
              </Pressable>
            ) : null,
        }}
      >
        <Stack.Screen
          name="Products"
          options={{
            title: "Skinalo",
            animation: "fade",
            headerLeft: () => (
              <Pressable
                onPress={() => router.replace("/")}
                hitSlop={10}
                style={{ paddingHorizontal: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Back to dashboard"
              >
                <Ionicons name="arrow-back" size={24} color="#0F172A" />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="ScanInstructions"
          options={{
            title: "Skinalo",
            animation: "fade_from_bottom",
            headerLeft: () => (
              <Pressable
                onPress={() => router.replace("/(scan)/Products")}
                hitSlop={10}
                style={{ paddingHorizontal: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Close instructions"
              >
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="Scanner"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="ImagePreview"
          options={{
            headerShown: false,
            animation: "fade_from_bottom",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="ManualInput"
          options={{
            title: "Manual Input",
            animation: "fade_from_bottom",
            gestureEnabled: false,
            headerLeft: () => (
              <Pressable
                onPress={() => router.replace("/(scan)/ScanInstructions")}
                hitSlop={10}
                style={{ paddingHorizontal: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Back to scan instructions"
              >
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="analyzing"
          options={{
            title: "Analyzing",
            animation: "fade",
            gestureEnabled: false,
            headerLeft: () => (
              <Pressable
                onPress={() => router.replace("/(scan)/ScanInstructions")}
                hitSlop={10}
                style={{ paddingHorizontal: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Back to scan instructions"
              >
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="error"
          options={{
            title: "Error",
            animation: "fade",
            gestureEnabled: false,
            headerLeft: () => (
              <Pressable
                onPress={() => router.replace("/(scan)/ScanInstructions")}
                hitSlop={10}
                style={{ paddingHorizontal: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Back to scan instructions"
              >
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            ),
          }}
        />

        <Stack.Screen
          name="Results"
          options={{
            title: "Analysis Results",
            animation: "fade",
            gestureEnabled: false,
            headerLeft: () => (
              <Pressable
                onPress={() => router.replace("/")}
                hitSlop={10}
                style={{ paddingHorizontal: 4 }}
                accessibilityRole="button"
                accessibilityLabel="Back to Home"
              >
                <Ionicons name="arrow-back" size={24} color="#0F172A" />
              </Pressable>
            ),
          }}
        />
      </Stack>
    </ScanProvider>
  );
}
