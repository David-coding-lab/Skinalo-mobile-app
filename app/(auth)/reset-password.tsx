import PrimaryButton from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const { updatePasswordRecovery, loading } = useAuth();
  const { userId, secret } = useLocalSearchParams<{
    userId: string;
    secret: string;
  }>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleReset = async (data: FormData) => {
    if (!userId || !secret) {
      setErrorStatus("Invalid link details. Please request a new link.");
      return;
    }

    try {
      setErrorStatus(null);
      await updatePasswordRecovery(userId, secret, data.password);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setErrorStatus(
        error.message || "Failed to reset password. Please try again."
      );
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg px-6 items-center justify-center">
        <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={40} color="#065f46" />
        </View>
        <Text className="font-latoBlack text-3xl text-center text-textDark mb-4">
          Password Reset Complete
        </Text>
        <Text className="font-publicSansRegular text-lg text-center text-textGray mb-10 leading-6">
          Your password has been successfully updated. You can now use your new password to sign in.
        </Text>
        <PrimaryButton
          text="Continue to Sign In"
          callBack={() => router.replace("/(auth)/sign-in")}
        />
      </SafeAreaView>
    );
  }

  if (!userId || !secret) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg px-6 items-center justify-center">
        <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="alert-circle" size={40} color="#991b1b" />
        </View>
        <Text className="font-latoBlack text-3xl text-center text-textDark mb-4">
          Invalid Request
        </Text>
        <Text className="font-publicSansRegular text-lg text-center text-textGray mb-10 leading-6">
          The reset password link is either invalid or has expired. Please request a new one.
        </Text>
        <PrimaryButton
          text="Back to Request link"
          callBack={() => router.replace("/(auth)/forgot-password")}
        />
      </SafeAreaView>
    );
  }

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
              <View className="mt-14">
                <Text className="font-latoBlack text-4xl text-textDark">
                  Create New Password
                </Text>
                <Text className="mt-4 font-publicSansRegular text-xl text-textGray leading-7">
                  Please enter your new password below. Ensure it is at least 8 characters long.
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

                <Text className="font-publicSansMedium text-lg">New Password</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Enter new password"
                      secureTextEntry
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="w-full h-16 rounded-xl font-latoRegular bg-white px-4 mt-2 border border-gray-100 shadow-sm"
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500 mt-1 ml-1">{errors.password.message}</Text>
                )}

                <Text className="font-publicSansMedium text-lg mt-6">Confirm Password</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Confirm new password"
                      secureTextEntry
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="w-full h-16 rounded-xl font-latoRegular bg-white px-4 mt-2 border border-gray-100 shadow-sm"
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <Text className="text-red-500 mt-1 ml-1">{errors.confirmPassword.message}</Text>
                )}
              </View>

              <View className="mt-auto">
                <PrimaryButton
                  text="Update Password"
                  callBack={handleSubmit(handleReset)}
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

export default ResetPassword;
