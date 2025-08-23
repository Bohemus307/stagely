import React, { useState, useEffect } from "react";
import { Animated } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/button";
import { LinearGradient } from "expo-linear-gradient";
import { IconSymbol } from "@/components/ui/IconSymbol";
// import { IconSymbol } from "@/components/ui/IconSymbol";

interface PhotoUploadOnboardingProps {
  onContinue: () => void;
  onSkip: () => void;
}

const PhotoUploadOnboarding: React.FC<PhotoUploadOnboardingProps> = ({
  onContinue,
  onSkip,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [iconScale] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 20,
        friction: 5,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, iconScale, slideAnim]);

  const features = [
    {
      icon: "sparkles",
      title: "AI-Powered Detection",
      description:
        "Our smart AI instantly identifies room types with high accuracy",
      color: "#8B5CF6",
    },
    {
      icon: "gauge",
      title: "Confidence Scores",
      description: "See exactly how confident our AI is about each detection",
      color: "#3B82F6",
    },
    {
      icon: "hand.tap.fill",
      title: "Easy Confirmation",
      description: "Simply confirm or adjust room types with a single tap",
      color: "#10B981",
    },
  ];

  return (
    <LinearGradient
      colors={["#6366F1", "#8B5CF6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <Box className="flex-1 px-6 pt-20 pb-10">
        {/* Skip Button */}
        <Box className="absolute top-12 right-6 z-10">
          <Button variant="link" onPress={onSkip} className="opacity-70">
            <ThemedText className="text-white">Skip</ThemedText>
          </Button>
        </Box>

        {/* Main Icon */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: iconScale }],
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <Box className="w-32 h-32 bg-white/20 rounded-full justify-center items-center">
            <Box className="w-24 h-24 bg-white rounded-full justify-center items-center">
              <ThemedText className="text-5xl">📸</ThemedText>
            </Box>
          </Box>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <ThemedText className="text-white text-4xl font-bold text-center mb-4">
            Smart Photo Upload
          </ThemedText>
          <ThemedText className="text-white/80 text-lg text-center mb-10">
            Experience the magic of AI-powered room detection
          </ThemedText>
        </Animated.View>

        {/* Features */}
        <Box className="gap-4 mb-10">
          {features.map((feature) => (
            <Animated.View
              key={feature.title}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              }}
            >
              <Box className="bg-white/10 rounded-2xl p-4 flex-row items-center">
                <Box
                  className="w-12 h-12 rounded-full justify-center items-center mr-4"
                  style={{ backgroundColor: feature.color }}
                >
                  <IconSymbol
                    name={feature.icon as any}
                    size={24}
                    color="white"
                  />
                </Box>
                <Box className="flex-1">
                  <ThemedText className="text-white font-semibold text-lg mb-1">
                    {feature.title}
                  </ThemedText>
                  <ThemedText className="text-white/70 text-sm">
                    {feature.description}
                  </ThemedText>
                </Box>
              </Box>
            </Animated.View>
          ))}
        </Box>

        {/* Call to Action */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            marginTop: "auto",
          }}
        >
          <Button
            variant="solid"
            onPress={onContinue}
            className="bg-white mb-4"
          >
            <ThemedText className="text-primary-600 font-semibold text-lg">
              Get Started
            </ThemedText>
          </Button>

          <ThemedText className="text-white/60 text-xs text-center">
            Your photos help our AI learn and improve over time
          </ThemedText>
        </Animated.View>

        {/* Decorative Elements */}
        <Box className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full" />
        <Box className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full" />
      </Box>
    </LinearGradient>
  );
};

export default PhotoUploadOnboarding;
