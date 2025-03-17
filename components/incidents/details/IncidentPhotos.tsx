import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ScrollView, Image } from "react-native";
import { IncidentImage } from "@/components/incidents/data/incidents"; // Adjust this import path as needed

interface IncidentPhotosProps {
  images: IncidentImage[];
  onPhotoPress?: (image: IncidentImage) => void;
}

const IncidentPhotos: React.FC<IncidentPhotosProps> = ({
  images,
  onPhotoPress,
}) => {
  if (!images || images.length === 0) {
    return null;
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
          <Box
            key={image.image_id}
            className="w-32 h-32 mr-3 rounded-lg overflow-hidden"
            onTouchEnd={() => onPhotoPress && onPhotoPress(image)}
          >
            {image.image_url ? (
              <Image
                source={{ uri: image.image_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Box className="w-full h-full bg-gray-200 rounded-lg items-center justify-center">
                <IconSymbol name="photo" size={30} color={"#9ca3af"} />
              </Box>
            )}
            {image.caption && (
              <Box className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-1">
                <ThemedText className="text-white text-xs" numberOfLines={1}>
                  {image.caption}
                </ThemedText>
              </Box>
            )}
          </Box>
        ))}
      </ScrollView>
    </Box>
  );
};

export default IncidentPhotos;
