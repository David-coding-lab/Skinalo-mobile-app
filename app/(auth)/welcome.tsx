import PrimaryButton from "@/components/PrimaryButton";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  return (
    <SafeAreaView className="flex-1 bg-pageBg" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center justify-center">
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

        <View className="mt-12 flex-1 items-center w-[85%]">
          <Text className="text-textDark text-4xl font-latoBlack text-center">
            Your Skin&#39;s Scientific Companion
          </Text>

          <Text className="mt-8  mb-auto text-center font-latoRegular text-xl text-textGray">
            AI-powered ingredient analysis tailored to your unique skin profile.
          </Text>

          <View className="w-full">
            <PrimaryButton
              callBack={() => null}
              route="sign-up"
              text="Get started"
            />
          </View>

          <TouchableOpacity
            onPress={() => router.push("./sign-in")}
            className="mb-5 gap-0 flex-row justify-center"
          >
            <Text className="text-textGray text-lg">
              Already have an account?{" "}
            </Text>
            <Text className="text-primary font-latoSemiBold text-lg">
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;
