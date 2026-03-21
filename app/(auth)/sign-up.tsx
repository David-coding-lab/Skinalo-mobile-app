import PrimaryButton from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
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

const signUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const SignUp = () => {
  const { register, loading } = useAuth();
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  type FormData = z.infer<typeof signUpSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    // Listen for keyboard show/hide events
    const showSubscription = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
      () => setKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSignUp = async (data: FormData) => {
    try {
      setErrorStatus(null);
      await register(data.email, data.password, data.name);
    } catch (error: any) {
      console.error("Error during sign up:", error);

      if (error.code === 409) {
        setErrorStatus("This email is already registered.");
      } else if (error.code === 0 || error.message?.includes("Network")) {
        setErrorStatus("Network error. Please check your internet connection.");
      } else if (error.code >= 500) {
        setErrorStatus("Server error. Skin care is on hold, try again later!");
      } else {
        setErrorStatus("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-pageBg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="items-center px-6 pb-10">
              {!isKeyboardVisible && (
                <>
                  <View className="w-24 h-24 bg-lightPrimaryOpacity rounded-full mt-5 items-center justify-center overflow-hidden border border-emerald-200">
                    <Image
                      className="w-16 h-16"
                      source={require("../../assets/images/skinalo-icon.png")}
                      resizeMode="contain"
                    />
                  </View>

                  <Text className="font-latoSemiBold text-3xl mt-3">
                    Skinalo
                  </Text>
                  <Text className="font-latoRegular text-lg mt-1 text-textGray">
                    DERMATOLOGY CARE
                  </Text>

                  <Image
                    resizeMode="contain"
                    className="w-[85vw] h-[300px]"
                    source={require("../../assets/images/auth-hero-img.png")}
                  />
                </>
              )}
              <Text className="w-80 text-textDark text-4xl font-latoBlack text-center">
                Join the Skinalo Community
              </Text>

              <Text className="mt-4 w-full text-center font-latoRegular text-xl text-textGray">
                Your journey to healthier, glowing skin starts here.
              </Text>

              <View
                className={`w-full mb-12 ${isKeyboardVisible ? "mt-5" : "mt-10"}`}
              >
                {errorStatus && (
                  <View className="w-full bg-red-50 border border-red-200 p-4 rounded-xl mb-4 flex-row items-center">
                    <Text className="text-red-700 font-publicSansMedium flex-1">
                      {errorStatus}
                    </Text>
                  </View>
                )}
                <Text className="font-publicSansMedium text-lg">Full Name</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Enter your full name"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="w-full h-16 rounded-lg font-latoRegular bg-white px-4 mt-2 border border-gray-100"
                    />
                  )}
                />
                {errors.name && (
                  <Text className="text-red-500">{errors.name.message}</Text>
                )}

                <Text className="font-publicSansMedium text-lg mt-4">
                  Email
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
                      className="w-full h-16 rounded-lg font-latoRegular bg-white px-4 mt-2 border border-gray-100"
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500">{errors.email.message}</Text>
                )}

                <Text className="font-publicSansMedium text-lg mt-4">
                  Password
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Enter your password"
                      secureTextEntry
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      className="w-full h-16 rounded-lg font-latoRegular bg-white px-4 mt-2 border border-gray-100"
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              <View className="w-full items-center justify-center">
                <PrimaryButton
                  callBack={handleSubmit(handleSignUp)}
                  text="Sign up"
                  hasLoading={loading}
                />

                <View className="flex-row justify-center items-center mt-4">
                  <View className="w-20 h-1 rounded-full bg-gray-200"></View>
                  <Text className="px-2 font-publicSansMedium text-textGray">
                    Or continue with
                  </Text>
                  <View className="w-20 h-1 rounded-full bg-gray-200"></View>
                </View>

                <TouchableOpacity className="mb-5 w-full max-w-[85vw] h-14 border border-textLightGray rounded-full flex-row justify-center items-center mt-10">
                  <Image
                    className="w-6 h-6 mr-3"
                    source={{
                      uri: "https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s48-fcrop64=1,00000000ffffffff-rw",
                    }}
                  />
                  <Text className="font-publicSansMedium text-lg">Google</Text>
                </TouchableOpacity>
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
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
