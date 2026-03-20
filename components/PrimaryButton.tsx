import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

const PrimaryButton = (props: {
  route?: string;
  text: string;
  callBack?: () => void;
  hasLoading?: boolean;
}) => {
  const { route, text, callBack, hasLoading } = props;
  return (
    <TouchableOpacity
      disabled={hasLoading}
      onPress={() => {
        if (route) {
          router.push(`./${route}`);
        } else if (callBack) {
          callBack();
        }
      }}
      className={`mt-auto mb-5 w-full max-w-[85vw] h-16 items-center justify-center rounded-full bg-primary ${hasLoading ? "opacity-70" : ""}`}
    >
      {hasLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className="text-white font-publicSansMedium text-lg">{text}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
