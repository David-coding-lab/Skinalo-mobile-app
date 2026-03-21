import { Stack } from "expo-router";
import React from "react";

const OnboardingLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Quiz" options={{ animation: "fade" }} />
    </Stack>
  );
};

export default OnboardingLayout;
