import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const PrimaryButton = (props: {
  route: string;
  text: string;
  callBack: () => void;
}) => {
  const { route, text, callBack } = props;
  return (
    <TouchableOpacity
      onPress={() => {
        if (route) {
          router.push(`./${route}`);
        } else {
          callBack();
        }
      }}
      className="mt-auto mb-5 w-full max-w-[85vw] h-16 items-center justify-center rounded-full bg-primary"
    >
      <Text className="color-white font-latoSemiBold text-lg">{text}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
