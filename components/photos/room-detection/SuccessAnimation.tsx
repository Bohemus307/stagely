import React, { useEffect, useState, useCallback } from "react";
import { Animated, Dimensions } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import Confetti from "react-native-confetti";

interface SuccessAnimationProps {
  roomType: string;
  imageCount: number;
  onComplete: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  roomType,
  imageCount,
  onComplete,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [checkmarkScale] = useState(new Animated.Value(0));
  const [hasCompleted, setHasCompleted] = useState(false);
  const confettiRef = React.useRef<any>(null);

  const { width, height } = Dimensions.get("window");

  const formatRoomName = (room: string | undefined | null) => {
    // Add defensive checks for undefined/null/non-string values
    if (!room || typeof room !== "string") {
      console.warn("formatRoomName received invalid room type:", room);
      return "Other"; // Safe fallback
    }

    try {
      return room
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    } catch (error) {
      console.error("Error formatting room name:", error);
      return "Other"; // Safe fallback
    }
  };

  const handleComplete = useCallback(() => {
    if (hasCompleted) return;
    setHasCompleted(true);

    if (confettiRef.current) {
      confettiRef.current.stopConfetti();
    }

    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      onComplete();
    }, 100);
  }, [hasCompleted, onComplete]);

  useEffect(() => {
    console.log("SuccessAnimation mounted with roomType:", roomType);

    // Start confetti
    if (confettiRef.current) {
      confettiRef.current.startConfetti();
    }

    // Animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 3,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto complete after 2.5 seconds
    const timer = setTimeout(() => {
      console.log("SuccessAnimation timer fired");
      handleComplete();
    }, 2500);

    return () => {
      console.log("SuccessAnimation cleanup");
      clearTimeout(timer);
      if (confettiRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        confettiRef.current.stopConfetti();
      }
    };
  }, [checkmarkScale, fadeAnim, handleComplete, scaleAnim, roomType]);

  return (
    <LinearGradient
      colors={["#10B981", "#059669", "#047857"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Confetti
        ref={confettiRef}
        confettiCount={50}
        timeout={0}
        duration={2000}
      />

      {/* Success Circle */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        }}
      >
        <Box className="w-40 h-40 bg-white/20 rounded-full justify-center items-center mb-8">
          <Box className="w-32 h-32 bg-white rounded-full justify-center items-center">
            <Animated.View
              style={{
                transform: [{ scale: checkmarkScale }],
              }}
            >
              <IconSymbol name="checkmark" size={60} color="#10B981" />
            </Animated.View>
          </Box>
        </Box>
      </Animated.View>

      {/* Success Message */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <ThemedText className="text-white text-3xl font-bold text-center mb-4">
          Perfect! 🎉
        </ThemedText>
      </Animated.View>

      {/* Fun Stats */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          marginTop: 40,
        }}
      >
        <Box className="bg-white/10 rounded-2xl p-6 mx-8">
          <Box className="flex-row justify-between mb-3">
            <ThemedText className="text-white/70">Photos uploaded</ThemedText>
            <ThemedText className="text-white font-bold">
              {imageCount}
            </ThemedText>
          </Box>
          <Box className="flex-row justify-between mb-3">
            <ThemedText className="text-white/70 mr-4">
              Room identified
            </ThemedText>
            <ThemedText className="text-white font-bold">
              {formatRoomName(roomType)}
            </ThemedText>
          </Box>
        </Box>
      </Animated.View>

      {/* Floating Elements */}
      {[...Array(5)].map((_, i) => (
        <Animated.View
          key={`float-${i}`}
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 30,
            left: Math.random() * (width - 60),
            top: Math.random() * (height - 60),
            transform: [
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1 + Math.random() * 0.5],
                }),
              },
            ],
          }}
        />
      ))}
    </LinearGradient>
  );
};

export default SuccessAnimation;
