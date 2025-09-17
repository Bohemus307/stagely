import React, { useState, useEffect } from "react";
import { SafeAreaView, Dimensions, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import { useUpdateProperty } from "@/hooks/properties/useUpdateProperty";
import { useS3Upload } from "@/hooks/useS3Upload";
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

  const {
    updateProperty,
    isPending: isUpdating,
    isSuccess,
    isError,
    error,
  } = useUpdateProperty(propertyId);

  const {
    uploadToS3,
    isLoading: uploading,
    error: uploadError,
  } = useS3Upload();

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
            onPress: () => {
              router.push("/(tabs)/(properties)/");
            },
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

  // Convert URI to Blob for useS3Upload
  const convertUriToBlob = async (uri: string): Promise<Blob> => {
    try {
      // Handle ph:// URIs from iOS photo library
      if (uri.startsWith("ph://")) {
        // Extract asset ID from ph:// URI
        const assetId = uri.replace("ph://", "").split("/")[0];

        // Get asset info to get the actual file URI
        const asset = await MediaLibrary.getAssetInfoAsync(assetId);

        // Use localUri if available, otherwise fall back to uri
        const actualUri = asset.localUri || asset.uri;

        if (!actualUri) {
          throw new Error("Could not get actual URI from photo library asset");
        }

        // Fetch the actual file
        const response = await fetch(actualUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();

        return blob;
      } else {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();

        return blob;
      }
    } catch (error) {
      console.error("[convertUriToBlob] Error:", error);
      throw error;
    }
  };
  const handleNext = async () => {
    const selectedImageArray = Array.from(selectedImages.values());

    if (selectedImageArray.length === 0) {
      Alert.alert("No Photo Selected", "Please select a photo first.");
      return;
    }

    try {
      const selectedImage = selectedImageArray[0];

      const fileName = getImageFileName(selectedImage.uri);

      // Convert URI to Blob for useS3Upload hook
      const blob = await convertUriToBlob(selectedImage.uri);

      // Upload to S3 using your working useS3Upload hook
      const uploadedUrl = await uploadToS3(blob, fileName);

      // Update property with new image URL
      updateProperty({
        imageUrl: uploadedUrl,
      });
    } catch (error) {
      console.error("[PropertyPhotoSelect] Error uploading photo:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      Alert.alert("Upload Error", `Failed to upload photo: ${errorMessage}`);
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
