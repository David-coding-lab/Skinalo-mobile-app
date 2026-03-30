import PrimaryButton from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const { sendEmailOTP, savePendingRecovery, loading } = useAuth();
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleSendOTP = async (data: FormData) => {
    try {
      setErrorStatus(null);
      const id = await sendEmailOTP(data.email);
      await savePendingRecovery({
        email: data.email,
        userId: id,
        resendAvailableAt: Date.now() + 60_000,
        createdAt: Date.now(),
      });
      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          email: data.email,
          userId: id,
        },
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      setErrorStatus(
        error.message || "Failed to send reset code. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-pageBg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 px-6 pb-10">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mt-4 w-10 h-10 items-center justify-center bg-white rounded-full border border-gray-100 shadow-sm"
              >
                <Ionicons name="arrow-back" size={24} color="#0F172A" />
              </TouchableOpacity>

              <View className="mt-10">
                <Text className="font-latoBlack text-4xl text-textDark">
                  Forgot Password?
                </Text>
                <Text className="mt-4 font-publicSansRegular text-xl text-textGray leading-7">
                  Don&apos;t worry! It happens. Please enter the email address
                  associated with your account.
                </Text>
              </View>

              <View className="mt-12 mb-10">
                {errorStatus && (
                  <View className="w-full bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
                    <Text className="text-red-700 font-publicSansMedium">
                      {errorStatus}
                    </Text>
                  </View>
                )}

                <Text className="font-publicSansMedium text-lg">
                  Email Address
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="name@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="w-full h-16 rounded-xl font-latoRegular bg-white px-4 mt-2 border border-gray-100 shadow-sm"
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 mt-1 ml-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              <View className="mt-auto">
                <PrimaryButton
                  text="Send Reset Code"
                  callBack={handleSubmit(handleSendOTP)}
                  hasLoading={loading}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
