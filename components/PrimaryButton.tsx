import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const PrimaryButton = (props: {
  route?: string;
  text: string;
  callBack?: () => void;
  hasLoading?: boolean;
  disabled?: boolean;
}) => {
  const { route, text, callBack, hasLoading, disabled } = props;
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (hasLoading) {
      rotation.value = withRepeat(
        withTiming(1, { duration: 1000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      rotation.value = 0;
    }
  }, [hasLoading, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value * 360}deg` }],
    };
  });

  return (
    <TouchableOpacity
      disabled={hasLoading || disabled}
      onPress={() => {
        if (route && route.length > 0) {
          router.push(`./${route}`);
        } else if (callBack) {
          callBack();
        }
      }}
      className={`mt-auto mb-5 w-full max-w-[85vw] h-16 items-center justify-center rounded-full bg-primary ${
        hasLoading ? "opacity-70" : ""
      }`}
    >
      {hasLoading ? (
        <Animated.View style={animatedStyle}>
          <MaterialCommunityIcons name="loading" size={24} color="white" />
        </Animated.View>
      ) : (
        <Text className="text-white font-publicSansMedium text-lg">{text}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
