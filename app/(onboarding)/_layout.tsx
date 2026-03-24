import { Stack } from "expo-router";
import React from "react";

const OnboardingLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Quiz" options={{ animation: "fade" }} />
      <Stack.Screen name="success" options={{ animation: "fade_from_bottom" }} />
    </Stack>
  );
};

export default OnboardingLayout;
