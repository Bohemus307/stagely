import React from "react";
import { SafeAreaView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/ui/button";

interface GalleryPermissionDeniedProps {
  onBack: () => void;
}

const GalleryPermissionDenied: React.FC<GalleryPermissionDeniedProps> = ({
  onBack,
}) => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center p-4">
      <ThemedText className="text-lg text-center mb-4">
        Media library access is required to select photos.
      </ThemedText>
      <Button onPress={onBack}>
        <ThemedText className="text-white">Go Back</ThemedText>
      </Button>
    </SafeAreaView>
  );
};

export default GalleryPermissionDenied;
