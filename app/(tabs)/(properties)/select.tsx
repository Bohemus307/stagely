import React, { useState, useEffect } from "react";
import { SafeAreaView, Dimensions, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import { useUpdateProperty } from "@/hooks/properties/useUpdateProperty";
import useS3ImageUpload from "@/hooks/useImageUpload";
import GalleryHeader from "@/components/photos/GalleryHeader";
import GalleryImageGrid from "@/components/photos/GalleryImageGrid";
import GalleryPermissionDenied from "@/components/photos/GalleryPermissionDenied";
import GalleryLoadingState from "@/components/photos/GalleryLoadingState";

interface SelectedImage {
  id: string;
  uri: string;
  selected: boolean;
}

const PropertyPhotoSelect = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedImages, setSelectedImages] = useState<
    Map<string, SelectedImage>
  >(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Hooks
  const {
    updateProperty,
    isPending: isUpdating,
    isSuccess,
    isError,
    error,
  } = useUpdateProperty(propertyId);
  const { uploadToS3, uploading } = useS3ImageUpload();

  const windowWidth = Dimensions.get("window").width;
  const imageSize = (windowWidth - 24) / 3;

  useEffect(() => {
    (async () => {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");

      if (status === "granted") {
        loadMediaAssets();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      Alert.alert(
        "Photo Updated",
        "The property photo has been successfully updated.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/(properties)/"),
          },
        ],
      );
    }
  }, [isSuccess]);

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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMediaAssets();
  };

  const toggleImageSelection = (asset: MediaLibrary.Asset) => {
    setSelectedImages((prevSelectedImages) => {
      const newSelectedImages = new Map();

      // For single selection: clear all and add only the new one
      newSelectedImages.set(asset.id, {
        id: asset.id,
        uri: asset.uri,
        selected: true,
      });

      return newSelectedImages;
    });
  };

  const getImageFileName = (uri: string): string => {
    // Extract filename from URI and ensure it has an appropriate extension
    const uriParts = uri.split("/");
    const fileName = uriParts[uriParts.length - 1];

    // If no extension, add .jpg
    if (!fileName.includes(".")) {
      return `${fileName}.jpg`;
    }

    return fileName;
  };

  const handleNext = async () => {
    const selectedImageArray = Array.from(selectedImages.values());

    if (selectedImageArray.length === 0) {
      Alert.alert("No Photo Selected", "Please select a photo first.");
      return;
    }

    try {
      const selectedImage = selectedImageArray[0]; // Only one image for property

      const fileName = getImageFileName(selectedImage.uri);

      // Convert the selected image to the format expected by useS3ImageUpload
      const imageAsset = {
        uri: selectedImage.uri,
        width: 0, // Will be filled by S3 upload hook if needed
        height: 0, // Will be filled by S3 upload hook if needed
        fileName: fileName,
      };

      // Upload to S3 using the existing hook
      const uploadResult = await uploadToS3(imageAsset);

      if (uploadResult?.success && uploadResult.url) {
        // Update property with new image URL
        updateProperty({
          imageUrl: uploadResult.url,
        });
      } else {
        throw new Error(uploadResult?.error || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Upload Error", "Failed to upload photo. Please try again.");
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (hasPermission === null || loading) {
    return <GalleryLoadingState />;
  }

  if (hasPermission === false) {
    return <GalleryPermissionDenied onBack={handleBack} />;
  }

  const selectedCount = selectedImages.size;

  // Show error if property update failed
  if (isError && error) {
    Alert.alert(
      "Update Failed",
      error.message || "Failed to update property photo. Please try again.",
    );
  }

  // Default: Show selection screen
  return (
    <SafeAreaView className="flex-1 p-4">
      {/* Header */}
      <GalleryHeader
        selectedCount={selectedCount}
        isLoading={uploading || isUpdating}
        onNext={handleNext}
      />

      {/* Image Grid */}
      <GalleryImageGrid
        mediaAssets={mediaAssets}
        selectedImages={selectedImages}
        onToggleSelection={toggleImageSelection}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        imageSize={imageSize}
      />
    </SafeAreaView>
  );
};

export default PropertyPhotoSelect;
