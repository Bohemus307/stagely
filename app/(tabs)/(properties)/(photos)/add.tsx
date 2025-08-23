import React from "react";
import { SafeAreaView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import BackButton from "@/components/BackButton";

/**
 * Modern photo source selection screen
 * Based on the design mockup
 */
const PhotoSelectionScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;

  const handleTakePhoto = (): void => {
    console.log("Taking a photo for property:", propertyId);
    // Navigate to camera screen
    // router.push({
    //   pathname: "/properties/[propertyId]/photos/camera",
    //   params: { propertyId },
    // });
  };

  const handleSelectFromGallery = (): void => {
    router.push({
      pathname: "/(tabs)/(properties)/(photos)/select",
      params: { propertyId },
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <Box className="flex-row justify-between items-center py-2">
        <BackButton />
        <ThemedText className="text-lg font-medium text-center flex-1 mr-24">
          Add Photos
        </ThemedText>
      </Box>
      <Box className="flex-1 px-2 py-4">
        {/* Header with title and close button */}

        {/* Option Cards */}
        <Box className="gap-4">
          {/* Take Photo Option */}
          <Pressable
            onPress={handleTakePhoto}
            className="bg-gray-200 rounded-xl overflow-hidden"
          >
            <Box className="flex-row items-center py-5 px-4">
              <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                <IconSymbol name="camera.fill" size={24} color="white" />
              </Box>
              <ThemedText className="text-lg font-medium">
                Take New Photo
              </ThemedText>
            </Box>
          </Pressable>

          {/* Upload from Gallery Option */}
          <Pressable
            onPress={handleSelectFromGallery}
            className="bg-gray-200 rounded-xl overflow-hidden"
          >
            <Box className="flex-row items-center py-5 px-4">
              <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                <IconSymbol name="plus" size={24} color="white" />
              </Box>
              <ThemedText className="text-lg font-medium">
                Upload from Gallery
              </ThemedText>
            </Box>
          </Pressable>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default PhotoSelectionScreen;
