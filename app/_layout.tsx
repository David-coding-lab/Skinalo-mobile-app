import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
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
        const isFirstTimeUser = await checkFirstTimeUser();

        if (loaded || error) {
          await SplashScreen.hideAsync();

          if (isFirstTimeUser) {
            router.push("/(auth)/welcome");
          }
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

  const checkFirstTimeUser = async () => {
    // Implement logic to check if the user is opening the app for the first time
    try {
      const isFirstTimeUser = await AsyncStorage.getItem("isFirstTimeUser");
      return isFirstTimeUser === null ? true : false; // If null, it's the first time
    } catch (error) {
      console.error("Error checking first time user:", error);
      return true;
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
