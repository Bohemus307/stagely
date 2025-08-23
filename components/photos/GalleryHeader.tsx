import React from "react";
import { Text } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";

interface GalleryHeaderProps {
  selectedCount: number;
  isLoading: boolean;
  onNext: () => void;
}

const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  selectedCount,
  isLoading,
  onNext,
}) => {
  return (
    <Box className="px-2 py-2 border-b border-gray-200">
      <Box className="flex-row justify-between items-center">
        <BackButton />

        <ThemedText className="text-lg font-medium">Select Photos</ThemedText>

        <Button
          variant="solid"
          disabled={selectedCount === 0 || isLoading}
          onPress={onNext}
          className={`bg-primary-500`}
        >
          <Text className="text-white">
            Next {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Text>
        </Button>
      </Box>
    </Box>
  );
};

export default GalleryHeader;
