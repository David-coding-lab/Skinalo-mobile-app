import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const { width } = Dimensions.get("window");

const LOADING_MESSAGES = [
  "Analyzing your skin profile...",
  "Calculating Fitzpatrick type...",
  "Evaluating hydration levels...",
  "Mapping pigment distribution...",
  "Assessing sensitivity factors...",
  "Determining anti-aging needs...",
  "Finalizing your clinical report...",
];

interface LoadingOverlayProps {
  isVisible: boolean;
  // setLoadingState: (loading: boolean) => void;
  onFinished: () => void;
}

const LoadingOverlay = ({
  isVisible,
  onFinished,
  // setLoadingState,
}: LoadingOverlayProps) => {
  const [currentMessage, setCurrentMessage] = useState(LOADING_MESSAGES[0]);
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 500 });

      // Start progress bar animation (6 seconds as discussed)
      progress.value = withTiming(
        1,
        {
          duration: 6000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        },
        (finished) => {
          if (finished) {
            // setLoadingState(true);
            scheduleOnRN(onFinished);
          }
        },
      );

      // Cycle through messages
      let messageIndex = 0;
      const interval = setInterval(() => {
        textOpacity.value = withSequence(
          withTiming(0, { duration: 300 }),
          withTiming(1, { duration: 300 }),
        );

        setTimeout(() => {
          messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
          setCurrentMessage(LOADING_MESSAGES[messageIndex]);
        }, 300);
      }, 1500);

      return () => clearInterval(interval);
    } else {
      opacity.value = withTiming(0, { duration: 500 });
      progress.value = 0;
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: isVisible ? "auto" : "none",
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#F8F9FA" }]} />

      <View style={styles.content}>
        <Image
          source={require("../assets/images/text-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View>
          <Text style={styles.heroText}>
            Setting up your personalized experience...
          </Text>
        </View>
        <View style={styles.loaderContainer}>
          <View style={styles.track} />
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>

        <Animated.View style={[styles.messageContainer, messageStyle]}>
          <Text style={styles.messageText}>{currentMessage}</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Ionicons
          name="shield-checkmark"
          size={16}
          color="#9CA3AF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.footerText}>Clinically Precise AI Analysis</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "80%",
    height: "100%",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 60,
    marginTop: 50,
  },
  loaderContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "#F8F6F6",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 20,
  },
  track: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E5E7EB",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10B981", // Dark/Clinical theme
    borderRadius: 2,
  },
  messageContainer: {
    height: 40,
    justifyContent: "center",
  },
  messageText: {
    fontSize: 16,
    color: "#4B5563",
    fontFamily: "PublicSans-Regular",
    textAlign: "center",
  },
  heroText: {
    fontSize: 28,
    fontFamily: "PublicSans-Medium",
    fontWeight: "800",
    color: "#333333",
    textAlign: "center",
    marginTop: "100%",
    marginBottom: 40,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    letterSpacing: 1,
    color: "#9CA3AF",
    fontFamily: "PublicSans-SemiBold",
  },
});

export default LoadingOverlay;
