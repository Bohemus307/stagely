import React from "react";
import { Image, Animated } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface RoomDetectionHeaderProps {
  imageUri: string;
  imageHeight: number;
  confidence: number;
}

const RoomDetectionHeader: React.FC<RoomDetectionHeaderProps> = ({
  imageUri,
  imageHeight,
  confidence,
}) => {
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "#10B981"; // Green
    if (value >= 60) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  const getConfidenceEmoji = (value: number) => {
    if (value >= 80) return "🎯";
    if (value >= 60) return "🤔";
    return "🔍";
  };

  return (
    <Box className="relative">
      <Image
        source={{ uri: imageUri }}
        style={{ width: "100%", height: imageHeight }}
        className="rounded-t-2xl"
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
        }}
      />

      {/* Confidence Badge */}
      <Box
        className="absolute top-4 right-4"
        style={{ overflow: "hidden", borderRadius: 12 }}
      >
        <BlurView intensity={90} tint="light">
          <Box className="px-4 py-2 flex-row items-center">
            <ThemedText className="text-sm font-semibold mr-1">
              {getConfidenceEmoji(confidence)}
            </ThemedText>
            <Animated.Text
              style={{
                color: getConfidenceColor(confidence),
                fontWeight: "600",
              }}
            >
              {Math.round(confidence)}% confident
            </Animated.Text>
          </Box>
        </BlurView>
      </Box>
    </Box>
  );
};

export default RoomDetectionHeader;
