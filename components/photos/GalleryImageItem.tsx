import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import * as MediaLibrary from "expo-media-library";

interface GalleryImageItemProps {
  asset: MediaLibrary.Asset;
  isSelected: boolean;
  onPress: () => void;
  imageSize: number;
}

const GalleryImageItem: React.FC<GalleryImageItemProps> = ({
  asset,
  isSelected,
  onPress,
  imageSize,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        width: imageSize,
        height: imageSize,
        margin: 4,
      }}
      className={`rounded-lg overflow-hidden ${isSelected ? "border-4 border-primary-500" : ""}`}
    >
      <Image source={{ uri: asset.uri }} className="w-full h-full" />
      {isSelected && (
        <Box className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 justify-center items-center">
          <IconSymbol name="checkmark" size={16} color="white" />
        </Box>
      )}
    </TouchableOpacity>
  );
};

export default GalleryImageItem;
