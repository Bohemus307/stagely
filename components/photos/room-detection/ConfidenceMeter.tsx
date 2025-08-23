import React from "react";
import { Animated } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";

interface ConfidenceMeterProps {
  confidence: number;
  confidenceAnim: Animated.Value;
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  confidenceAnim,
}) => {
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "#10B981"; // Green
    if (value >= 60) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  return (
    <Box className="mb-8">
      <Box className="flex-row justify-between mb-2">
        <ThemedText className="text-sm font-medium text-gray-600">
          AI Confidence
        </ThemedText>
        <ThemedText
          className="text-sm font-semibold"
          style={{ color: getConfidenceColor(confidence) }}
        >
          {Math.round(confidence)}%
        </ThemedText>
      </Box>
      <Box className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <Animated.View
          style={{
            width: confidenceAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            height: "100%",
            backgroundColor: getConfidenceColor(confidence),
          }}
          className="rounded-full"
        />
      </Box>
    </Box>
  );
};

export default ConfidenceMeter;
