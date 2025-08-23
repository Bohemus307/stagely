import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface ProcessingScreenProps {
  progress?: number;
  currentStatus?: string;
  totalImages?: number;
  currentImage?: number;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  progress = 0,
  currentStatus = "",
  totalImages = 1,
  currentImage = 1,
}) => {
  const statusMessages = [
    "Uploading image...",
    "Analyzing room features...",
    "Detecting furniture and decor...",
    "Processing spatial layout...",
    "Finalizing room detection...",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Update message based on progress
    const messageIndex = Math.min(
      Math.floor((progress / 100) * statusMessages.length),
      statusMessages.length - 1,
    );
    setCurrentMessageIndex(messageIndex);
  }, [progress, statusMessages.length]);

  // Use the provided status or fall back to default messages
  const displayStatus = currentStatus || statusMessages[currentMessageIndex];

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <Box className="flex-1 justify-center items-center p-6">
        {/* Main Card */}
        <Card
          variant="elevated"
          size="lg"
          className="w-full max-w-sm shadow-soft-2"
        >
          <Box className="items-center">
            {/* Icon Container */}
            <Box className="w-24 h-24 bg-primary-100 rounded-full justify-center items-center mb-6">
              <Box className="w-20 h-20 bg-primary-500 rounded-full justify-center items-center">
                {progress < 100 ? (
                  <Spinner size="large" color="white" />
                ) : (
                  <IconSymbol name="checkmark" size={32} color="white" />
                )}
              </Box>
            </Box>

            {/* Title */}
            <ThemedText
              type="defaultSemiBold"
              className="text-xl text-center mb-2"
            >
              Processing {totalImages > 1 ? "Images" : "Image"}
            </ThemedText>

            {/* Status Message */}
            <ThemedText className="text-typography-600 text-center mb-6">
              {displayStatus}
            </ThemedText>

            {/* Progress Bar */}
            <Box className="w-full">
              <Box className="h-2 bg-background-200 rounded-full overflow-hidden mb-2">
                <Box
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </Box>

              {/* Progress Text */}
              <Box className="flex-row justify-between items-center">
                <ThemedText className="text-sm text-typography-500">
                  {totalImages > 1 && `Image ${currentImage} of ${totalImages}`}
                </ThemedText>
                <ThemedText className="text-sm text-typography-500">
                  {Math.round(progress)}%
                </ThemedText>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Additional Info Card */}
        <Card variant="filled" size="md" className="w-full max-w-sm mt-6">
          <Box className="flex-row items-center">
            <IconSymbol
              name="lightbulb"
              size={20}
              color="#6366F1"
              style={{ marginRight: 8 }}
            />
            <ThemedText className="text-sm text-typography-600 flex-1">
              Our AI analyzes your photos to automatically categorize rooms and
              detect furniture
            </ThemedText>
          </Box>
        </Card>
      </Box>
    </SafeAreaView>
  );
};

export default ProcessingScreen;
