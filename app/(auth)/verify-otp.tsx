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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "The code must be exactly 6 digits")
    .regex(/^\d{6}$/, "The code must contain only numbers"),
});

type OTPFormData = z.infer<typeof otpSchema>;

const VerifyOTP = () => {
  const {
    sendEmailOTP,
    verifyEmailOTP,
    savePendingRecovery,
    getPendingRecovery,
    clearPendingRecovery,
    setRecoveryVerified,
    clearRecoveryVerified,
    loading,
  } = useAuth();
  const { userId, email } = useLocalSearchParams<{
    userId?: string;
    email?: string;
  }>();

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [resendAvailableAt, setResendAvailableAt] = useState<number>(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    const hydrateRecovery = async () => {
      const pending = await getPendingRecovery();

      if (email && userId) {
        const seed =
          pending && pending.email === email && pending.userId === userId
            ? pending
            : {
                email,
                userId,
                resendAvailableAt: Date.now() + 60_000,
                createdAt: Date.now(),
              };
        setCurrentEmail(seed.email);
        setCurrentUserId(seed.userId);
        setResendAvailableAt(seed.resendAvailableAt);
        await savePendingRecovery(seed);
        return;
      }

      if (pending) {
        setCurrentEmail(pending.email);
        setCurrentUserId(pending.userId);
        setResendAvailableAt(pending.resendAvailableAt);
      }
    };

    hydrateRecovery();
  }, [email, userId, getPendingRecovery, savePendingRecovery]);

  useEffect(() => {
    if (!resendAvailableAt) {
      setTimer(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((resendAvailableAt - Date.now()) / 1000),
      );
      setTimer(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [resendAvailableAt]);

  const handleVerify = async (data: OTPFormData) => {
    if (!currentUserId || !currentEmail || isSubmitting || loading) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorStatus(null);
      const sanitizedOtp = data.otp.replace(/\D/g, "").trim();
      await verifyEmailOTP(currentUserId, sanitizedOtp);
      await setRecoveryVerified({
        email: currentEmail,
        userId: currentUserId,
        secret: sanitizedOtp,
        verifiedAt: Date.now(),
      });
      router.replace({
        pathname: "/(auth)/new-password",
        params: { email: currentEmail },
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setErrorStatus(
        error.message || "Invalid code. Please try again with the latest code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!currentEmail || timer > 0 || loading) return;

    try {
      setErrorStatus(null);
      const nextUserId = await sendEmailOTP(currentEmail);
      setCurrentUserId(nextUserId);
      const nextResendAvailableAt = Date.now() + 60_000;
      setResendAvailableAt(nextResendAvailableAt);
      await savePendingRecovery({
        email: currentEmail,
        userId: nextUserId,
        resendAvailableAt: nextResendAvailableAt,
        createdAt: Date.now(),
      });
    } catch (error: any) {
      setErrorStatus(
        error.message || "Failed to resend code. Please try again.",
      );
    }
  };

  const handleUseAnotherEmail = async () => {
    await clearPendingRecovery();
    await clearRecoveryVerified();
    router.replace("/(auth)/forgot-password");
  };

  if (!currentEmail || !currentUserId) {
    return (
      <SafeAreaView className="flex-1 bg-pageBg px-6 items-center justify-center">
        <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="alert-circle" size={40} color="#991b1b" />
        </View>
        <Text className="font-latoBlack text-3xl text-center text-textDark mb-4">
          Invalid Request
        </Text>
        <Text className="font-publicSansRegular text-lg text-center text-textGray mb-10 leading-6">
          Please start again from the forgot password screen.
        </Text>
        <PrimaryButton
          text="Back to Forgot Password"
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
                  Verify Reset Code
                </Text>
                <Text className="mt-4 font-publicSansRegular text-xl text-textGray leading-7">
                  Enter the 6-digit code sent to {currentEmail}.
                </Text>
                <Text className="mt-3 font-publicSansRegular text-sm text-textGray leading-6">
                  Code expires in 15 minutes. If you resend, only the newest
                  code will work.
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
                  6-Digit Code
                </Text>
                <Controller
                  control={control}
                  name="otp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="123456"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={(text) =>
                        onChange(text.replace(/\D/g, "").trim())
                      }
                      className="w-full h-16 rounded-xl font-latoRegular bg-white px-4 mt-2 border border-gray-100 shadow-sm"
                    />
                  )}
                />
                {errors.otp && (
                  <Text className="text-red-500 mt-1">
                    {errors.otp.message}
                  </Text>
                )}

                <View className="w-full mt-8 items-center">
                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={timer > 0 || loading}
                    className={`flex-row items-center py-2 px-4 rounded-full ${timer > 0 ? "opacity-60" : "bg-emerald-50"}`}
                  >
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={timer > 0 ? "#64748B" : "#059669"}
                    />
                    <Text
                      className={`ml-2 font-publicSansMedium ${timer > 0 ? "text-slate-500" : "text-emerald-700"}`}
                    >
                      {timer > 0
                        ? `Resend in ${timer}s`
                        : "Didn't see the code? Resend"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="w-full mt-5 items-center">
                  <TouchableOpacity onPress={handleUseAnotherEmail}>
                    <Text className="text-primary font-publicSansMedium">
                      Use another email
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-auto">
                <PrimaryButton
                  text="Verify Code"
                  callBack={handleSubmit(handleVerify)}
                  hasLoading={loading || isSubmitting}
                  disabled={loading || isSubmitting}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyOTP;
