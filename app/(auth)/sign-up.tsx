import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Image, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  useEffect(() => {
    const markNotFirstTimeUser = async () => {
      try {
        const firstTimeUser = await AsyncStorage.getItem("firstTimeUser");
        if (firstTimeUser) {
          await AsyncStorage.setItem("isFirstTimeUser", "false");
        }
      } catch (error) {
        console.error("Error removing first time user flag:", error);
      }
    };

    markNotFirstTimeUser();
  }, []);
  return (
    <SafeAreaView className="flex-1 items-center bg-pageBg">
      <View className="w-24 h-24 bg-lightPrimaryOpacity rounded-full mt-5 items-center justify-center overflow-hidden border border-emerald-200">
        <Image
          className="w-16 h-16"
          source={require("../../assets/images/skinalo-icon.png")}
          resizeMode="contain"
        />
      </View>

      <Text className="font-latoSemiBold text-3xl mt-3">Skinalo</Text>
      <Text className="font-latoRegular text-lg mt-1 text-textGray">
        DERMATOLOGY CARE
      </Text>

      <Image
        resizeMode="contain"
        className="w-[85vw] h-[300px] "
        source={require("../../assets/images/auth-hero-img.png")}
      />

      <Text className="w-80 text-textDark text-4xl font-latoBlack text-center">
        Join the Skinalo Community
      </Text>

      <Text className="mt-4 w-[80vw] text-center font-latoRegular  text-xl text-textGray">
        Your journey to healthier, glowing skin starts here.
      </Text>

      <View className="flex-1 items-start  w-full mt-16 px-6">
        <Text className="font-publicSansMedium text-lg">Full Name</Text>
        <TextInput
          placeholder="Enter your full name"
          className="w-full h-20 rounded-lg font-latoRegular bg-white  px-4 mt-2"
        />
        <Text className="font-publicSansMedium  text-lg">Email</Text>
        <TextInput
          placeholder="name@example.com"
          className="w-full h-20 rounded-lg font-latoRegular bg-white  px-4 mt-2"
        />
        <Text className="font-publicSansMedium text-lg">Password</Text>
        <TextInput
          placeholder="Enter your password"
          className="w-full h-20 rounded-lg font-latoRegular bg-white  px-4 mt-2"
        />
      </View>
    </SafeAreaView>
  );
};

export default SignUp;
