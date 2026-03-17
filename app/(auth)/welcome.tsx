import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  return (
    <SafeAreaView className="flex-1 items-center bg-pageBg">
      <View className="items-center text-center justify-center">
        <View>
          <Image
            className="my-12"
            source={require("../../assets/images/text-logo.png")}
          />
        </View>
        <View>
          <Image
            className=""
            source={require("../../assets/images/Hero Image.png")}
          />
        </View>
      </View>

      <View className="mt-12 flex-1 items-center w-4/5">
        <Text className="text-textDark text-4xl font-latoBlack text-center">
          Your Skin&#39;s Scientific Companion
        </Text>

        <Text className="mt-8 text-center font-latoRegular  text-xl text-textGray">
          AI-powered ingredient analysis tailored to your unique skin profile.
        </Text>

        <TouchableOpacity className="mt-auto mb-5 w-full max-w-96 h-20 items-center justify-center rounded-full bg-primary">
          <Text className="color-white font-latoSemiBold text-lg">
            Get started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="mb-5 gap-0 flex-row justify-center">
          <Text className="text-textGray text-lg">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity>
            <Text className="text-primary font-latoSemiBold text-lg">
              Login
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
