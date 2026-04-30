import AuthProvider from "@/context/AuthProvider";
import { ScanProvider } from "@/context/ScanProvider";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Lato-Regular": require("../assets/fonts/Lato-Regular.ttf"),
    "Lato-Black": require("../assets/fonts/Lato-Black.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato-Bold.ttf"), // Map SemiBold to Bold
    "PublicSans-Regular": require("../assets/fonts/static/PublicSans-Regular.ttf"),
    "PublicSans-Bold": require("../assets/fonts/static/PublicSans-Bold.ttf"),
    "PublicSans-SemiBold": require("../assets/fonts/static/PublicSans-SemiBold.ttf"),
    "PublicSans-Medium": require("../assets/fonts/static/PublicSans-Medium.ttf"),
    "PublicSans-ExtraBold": require("../assets/fonts/static/PublicSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (loaded || error) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.warn("Error preparing app:", error);
      }
    }
    prepare();
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <ScanProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ScanProvider>
    </AuthProvider>
  );
}
