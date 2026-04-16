import { Stack } from "expo-router";
import React from "react";

const ScanLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Products" options={{ animation: "fade" }} />
    </Stack>
  );
};

export default ScanLayout;
