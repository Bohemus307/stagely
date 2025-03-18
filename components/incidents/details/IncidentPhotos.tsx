import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ScrollView, Pressable } from "react-native";
import { IncidentImage } from "@/components/incidents/data/incidents";

interface IncidentPhotosProps {
  images: IncidentImage[];
  onPhotoPress?: (image: IncidentImage) => void;
}

const IncidentPhotos: React.FC<IncidentPhotosProps> = ({
  images,
  onPhotoPress,
}) => {
  if (!images || images.length === 0) {
    return (
      <Box className="rounded-lg shadow-lg overflow-hidden bg-white">
        <ThemedText className="font-bold text-lg mb-3">Photos</ThemedText>
        <Box className="h-32 bg-gray-100 rounded-lg items-center justify-center">
          <IconSymbol name="photo" size={30} color="#9ca3af" />
          <ThemedText className="text-gray-500 mt-2">
            No photos available
          </ThemedText>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="bg-white mx-4 p-4 rounded-lg shadow-sm mb-4">
      <ThemedText className="font-bold text-lg mb-3">Photos</ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 10 }}
      >
        {images.map((image) => (
          <Pressable
            key={image.image_id}
            onPress={() => onPhotoPress && onPhotoPress(image)}
          >
            <Box className="w-32 h-32 mr-3 rounded-lg overflow-hidden">
              <Box className="w-full h-full bg-primary-50 rounded-lg items-center justify-center">
                <IconSymbol name="photo" size={30} color="#9ca3af" />
              </Box>
            </Box>
          </Pressable>
        ))}
      </ScrollView>
    </Box>
  );
};

export default IncidentPhotos;
