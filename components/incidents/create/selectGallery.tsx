import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface GalleryGridProps {
  onSelectPhoto: (uri: string) => void;
  selectedPhotoUri?: string;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  onSelectPhoto,
  selectedPhotoUri,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const windowWidth = Dimensions.get("window").width;
  const imageSize = (windowWidth - 48) / 3; // Account for padding

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        loadMediaAssets();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const loadMediaAssets = async () => {
    try {
      setLoading(true);
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 100,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      setMediaAssets(assets);
    } catch (error) {
      console.error("Error loading media assets:", error);
      Alert.alert("Error", "Failed to load photos from gallery");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMediaAssets();
  };

  const renderImageItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const isSelected = selectedPhotoUri === item.uri;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSelectPhoto(item.uri)}
        style={{
          width: imageSize,
          height: imageSize,
          margin: 4,
        }}
        className={`rounded-lg overflow-hidden ${isSelected ? "border-4 border-primary-500" : ""}`}
      >
        <Image
          source={{ uri: item.uri }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {isSelected && (
          <Box className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 justify-center items-center">
            <IconSymbol name="checkmark" size={16} color="white" />
          </Box>
        )}
      </TouchableOpacity>
    );
  };

  if (hasPermission === null || loading) {
    return (
      <Box className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" className="text-primary-500" />
        <ThemedText className="mt-2 text-gray-600">
          Loading gallery...
        </ThemedText>
      </Box>
    );
  }

  if (hasPermission === false) {
    return (
      <Box className="flex-1 justify-center items-center py-12 px-4">
        <IconSymbol
          name="photo.badge.exclamationmark"
          size={48}
          color="#9CA3AF"
        />
        <ThemedText className="text-lg text-center mt-4">
          Gallery Access Required
        </ThemedText>
        <ThemedText className="text-sm text-center text-gray-600 mt-2">
          Please grant access to your photo library in Settings to select photos
        </ThemedText>
      </Box>
    );
  }

  if (mediaAssets.length === 0) {
    return (
      <Box className="flex-1 justify-center items-center py-12">
        <IconSymbol name="photo" size={48} color="#9CA3AF" />
        <ThemedText className="text-lg mt-4">No Photos Found</ThemedText>
        <ThemedText className="text-sm text-gray-600 mt-2">
          Your photo library appears to be empty
        </ThemedText>
      </Box>
    );
  }

  return (
    <FlatList
      data={mediaAssets}
      renderItem={renderImageItem}
      keyExtractor={(item) => item.id}
      numColumns={3}
      showsVerticalScrollIndicator={true}
      initialNumToRender={21}
      maxToRenderPerBatch={21}
      onRefresh={handleRefresh}
      refreshing={refreshing}
      removeClippedSubviews={true}
      windowSize={7}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};
