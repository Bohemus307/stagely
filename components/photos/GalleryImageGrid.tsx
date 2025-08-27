import React from "react";
import { FlatList } from "react-native";
import * as MediaLibrary from "expo-media-library";
import GalleryImageItem from "./GalleryImageItem";

interface SelectedImage {
  id: string;
  uri: string;
  selected: boolean;
}

interface GalleryImageGridProps {
  mediaAssets: MediaLibrary.Asset[];
  selectedImages: Map<string, SelectedImage>;
  onToggleSelection: (asset: MediaLibrary.Asset) => void;
  onRefresh: () => void;
  refreshing: boolean;
  imageSize: number;
}

const GalleryImageGrid: React.FC<GalleryImageGridProps> = ({
  mediaAssets,
  selectedImages,
  onToggleSelection,
  onRefresh,
  refreshing,
  imageSize,
}) => {
  const renderImageItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const isSelected = selectedImages.has(item.id);

    return (
      <GalleryImageItem
        asset={item}
        isSelected={isSelected}
        onPress={() => onToggleSelection(item)}
        imageSize={imageSize}
      />
    );
  };

  return (
    <FlatList
      data={mediaAssets}
      renderItem={renderImageItem}
      keyExtractor={(item) => item.id}
      numColumns={3}
      showsVerticalScrollIndicator={true}
      initialNumToRender={21}
      maxToRenderPerBatch={21}
      onRefresh={onRefresh}
      refreshing={refreshing}
      removeClippedSubviews={true}
      windowSize={7}
    />
  );
};

export default GalleryImageGrid;
