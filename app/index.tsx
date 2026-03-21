import { useAuth } from "@/context/AuthProvider";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { user, loading, logout } = useAuth();

  // Guard to prevent any rendering of the home content while we are still loading/redirecting
  if (loading || !user) return null;

  return (
    <SafeAreaView className="flex-1 bg-pageBg">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold font-publicSansBold text-textDark">
          Welcome back,
        </Text>
        <Text className="text-xl font-medium font-publicSansMedium text-primary mt-2">
          {user.name}
        </Text>

        <TouchableOpacity onPressIn={() => logout()}>
          <Text className="text-base font-publicSansMedium text-primary mt-4">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
