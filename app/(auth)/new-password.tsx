import PrimaryButton from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthProvider";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const NewPassword = () => {
  const {
    completePasswordReset,
    recoveryVerified,
    clearPendingRecovery,
    clearRecoveryVerified,
    loading,
  } = useAuth();
  const { email } = useLocalSearchParams<{
    email?: string;
  }>();

  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    setIsCheckingAccess(false);
  }, []);

  const handleUpdatePassword = async (data: PasswordFormData) => {
    if (!recoveryVerified || isSubmitting || loading) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorStatus(null);
      await completePasswordReset(data.password);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Error updating password:", error);
      setErrorStatus(
        error.message || "Failed to update password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAccess) {
    return <SafeAreaView className="flex-1 bg-pageBg" />;
  }

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg pt-5 px-6 items-center justify-center">
        <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={40} color="#065f46" />
        </View>
        <Text className="font-latoBlack text-3xl text-center text-textDark mb-4">
          Password Updated
        </Text>
        <Text className="font-publicSansRegular text-lg text-center text-textGray mb-10 leading-6">
          Your password was changed successfully. You are now signed in.
        </Text>
        <PrimaryButton text="Continue" callBack={() => router.replace("/")} />
      </SafeAreaView>
    );
  }

  if (!recoveryVerified && !isSubmitting) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg pt-5 px-6 items-center justify-center">
        <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="alert-circle" size={40} color="#991b1b" />
        </View>
        <Text className="font-latoBlack text-3xl text-center text-textDark mb-4">
          Verification Required
        </Text>
        <Text className="font-publicSansRegular text-lg text-center text-textGray mb-10 leading-6">
          Please verify your reset code before setting a new password.
        </Text>
        <PrimaryButton
          text="Go to Verify Code"
          callBack={() =>
            router.replace({
              pathname: "/(auth)/forgot-password",
            })
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-pageBg pt-5">
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
                  Set a new password for{" "}
                  {email || recoveryVerified?.email || "your account"}.
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
                  New Password
                </Text>
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
                  <Text className="text-red-500 mt-1 ml-1">
                    {errors.password.message}
                  </Text>
                )}

                <Text className="font-publicSansMedium text-lg mt-6">
                  Confirm Password
                </Text>
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
                  <Text className="text-red-500 mt-1 ml-1">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>

              <View className="mt-auto">
                <PrimaryButton
                  text="Update Password"
                  callBack={handleSubmit(handleUpdatePassword)}
                  hasLoading={loading || isSubmitting}
                  disabled={loading || isSubmitting}
                />
              </View>

              <View className="items-center mt-2 mb-6">
                <Text
                  className="text-primary font-publicSansMedium"
                  onPress={async () => {
                    await clearPendingRecovery();
                    await clearRecoveryVerified();
                    router.replace("/(auth)/forgot-password");
                  }}
                >
                  Start over with another email
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewPassword;
