import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SuccessScreen = () => {
  const handleStartScan = () => {
    router.replace("/");
  };

  const handleGoToDashboard = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-10 pb-8 items-center justify-between">
          {/* Header Section */}
          <View className="items-center w-full">
            <View className="bg-green-100 p-4 rounded-full mb-6">
              <Image
                source={require("@/assets/images/successCheck.png")}
                style={{ width: 80, height: 80 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl text-textDark font-latoBlack text-center mb-2">
              Profile Complete!
            </Text>
            <Text className="text-lg font-latoRegular text-[#64748B] text-center px-4 leading-6">
              Your personalized skincare journey starts now. Our AI is ready to
              analyze your products with clinical precision.
            </Text>
          </View>

          {/* Illustration Section */}
          <View className="w-full items-center my-8 rounded-[48px] overflow-hidden">
            <Image
              source={require("@/assets/images/Clinical-Green-Illustration.png")}
              style={{ width: "85%", height: 330, borderRadius: 48 }}
              resizeMode="cover"
            />
          </View>

          {/* Footer Actions */}
          <View className="w-full space-y-4">
            <TouchableOpacity
              onPress={handleStartScan}
              activeOpacity={0.8}
              className="w-full bg-[#2A5C43] py-5 rounded-[12px] flex-row items-center justify-center shadow-lg shadow-[#2A5C43]/20"
            >
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text className="text-white text-xl font-bold ml-3 pt-1">
                Start Your First Scan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGoToDashboard}
              className="w-full py-4 items-center"
            >
              <Text className="text-textLightGray font-publicSansBold mt-3 text-lg">
                Go to Dashboard
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SuccessScreen;
