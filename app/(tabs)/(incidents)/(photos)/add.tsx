import React from "react";
import { SafeAreaView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import BackButton from "@/components/BackButton";

/**
 * Photo source selection screen for incidents
 * Based on the design mockup and matching the property version
 */
const IncidentPhotoSelectionScreen = () => {
  const params = useLocalSearchParams();
  const incidentId = params.incidentId as string;

  const handleTakePhoto = (): void => {
    console.log("Taking a photo for incident:", incidentId);

    router.push({
      pathname: "/(tabs)/(incidents)/camera",
      params: { incidentId },
    });
  };

  const handleSelectFromGallery = (): void => {
    console.log("Selecting from gallery for incident:", incidentId);
    // Navigate to gallery selection screen
    router.push({
      pathname: "/(tabs)/(incidents)/(photos)/select",
      params: { incidentId },
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <Box className="flex-row justify-between items-center py-2">
        <BackButton />
        <ThemedText className="text-lg font-medium text-center flex-1 mr-24">
          Add Incident Photos
        </ThemedText>
      </Box>
      <Box className="flex-1 px-2 py-4">
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

export default IncidentPhotoSelectionScreen;
