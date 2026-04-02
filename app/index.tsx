import { useAuth } from "@/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  Image,
  ImageBackground,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user, loading, logout } = useAuth();

  // Guard to prevent any rendering of the home content while we are still loading/redirecting
  if (loading || !user) return null;

  return (
    <SafeAreaView className="flex-1 bg-pageBg">
      <View className="h-[60%] w-full items-center justify-center">
        <ImageBackground
          className="flex-1 h-40 w-full"
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
                  <Text className="text-slate-800 text-lg font-publicSansSemiBold">
                    Scan product
                  </Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}
