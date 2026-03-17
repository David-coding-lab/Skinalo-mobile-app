import { Stack } from "expo-router";
import React from "react";

const Auth = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Auth;
