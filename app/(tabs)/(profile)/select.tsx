import React, { useState, useEffect } from "react";
import { SafeAreaView, Dimensions, Alert } from "react-native";
import { router } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { useUpdateUser } from "@/hooks/profile/useUpdateUser";
import { useAuthUser } from "@/hooks/useAuthUser";
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

const ProfileGallerySelectScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedImage, setSelectedImage] = useState<
    Map<string, SelectedImage>
  >(new Map());

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const { backendUser: user } = useAuthUser();
  const userId = user?.id ? user.id.toString() : undefined;

  const { uploadToS3 } = useS3Upload();
  const {
    updateUser,
    isPending: isUpdating,
    isSuccess,
  } = useUpdateUser(userId);
  const windowWidth = Dimensions.get("window").width;
  const imageSize = (windowWidth - 40) / 3;

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

  useEffect(() => {
    if (isSuccess) {
      Alert.alert(
        "Profile Photo Updated",
        "Your profile photo has been successfully updated.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/(profile)"),
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
    setSelectedImage((prevSelectedImage) => {
      const newSelectedImages = new Map();

      newSelectedImages.set(asset.id, {
        id: asset.id,
        uri: asset.uri,
        selected: true,
      });

      return newSelectedImages;
    });
  };

  const getImageFileName = (uri: string): string => {
    const uriParts = uri.split("/");
    const fileName = uriParts[uriParts.length - 1];

    if (!fileName.includes(".")) {
      return `${fileName}.jpg`;
    }

    return fileName;
  };

  const getImageBlob = async (uri: string): Promise<Blob> => {
    const generateUniqueFileName = () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      return `temp_upload_image_${timestamp}_${random}.jpg`;
    };

    let tempFileUri: string | null = null;

    try {
      if (uri.startsWith("ph://")) {
        try {
          const assetId = uri.replace("ph://", "").split("/")[0];

          const asset = await MediaLibrary.getAssetInfoAsync(assetId);

          if (asset.localUri) {
            uri = asset.localUri;
          }
        } catch (error) {
          console.warn(
            "Could not get asset info, trying file copy method:",
            error,
          );
          try {
            const uniqueFileName = generateUniqueFileName();
            tempFileUri = FileSystem.cacheDirectory + uniqueFileName;

            const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
            if (fileInfo.exists) {
              await FileSystem.deleteAsync(tempFileUri);
            }

            await FileSystem.copyAsync({
              from: uri,
              to: tempFileUri,
            });

            uri = tempFileUri;
          } catch (copyError) {
            console.error("[getImageBlob] Error copying file:", copyError);
            throw copyError;
          }
        }
      }

      const response = await fetch(uri);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
      }

      const blob = await response.blob();

      return blob;
    } catch (error) {
      console.error("[getImageBlob] Error creating blob:", error);
      if (error instanceof Error) {
        console.error("[getImageBlob] Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      throw error;
    } finally {
      if (tempFileUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(tempFileUri);
          }
        } catch (cleanupError) {
          console.warn(
            "[getImageBlob] Error cleaning up temporary file:",
            cleanupError,
          );
        }
      }
    }
  };

  const handleNext = async () => {
    const selectedImageArray = Array.from(selectedImage.values());

    if (selectedImageArray.length === 0) {
      Alert.alert("No Photo Selected", "Please select a photo first.");
      return;
    }

    setUploading(true);

    try {
      const selectedImageData = selectedImageArray[0];

      const imageBlob = await getImageBlob(selectedImageData.uri);
      const fileName = getImageFileName(selectedImageData.uri);
      const uploadUrl = await uploadToS3(imageBlob, fileName);

      if (uploadUrl) {
        const encodedUrl = encodeURI(uploadUrl);
        await updateUser({ profilePictureUrl: encodedUrl });
      } else {
        throw new Error("Upload failed - no URL returned");
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
      Alert.alert("Upload Error", "Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
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

  const selectedCount = selectedImage.size;

  return (
    <SafeAreaView className="flex-1 p-4">
      {/* Header */}
      <GalleryHeader
        selectedCount={selectedCount}
        isLoading={loading || isUpdating || uploading}
        onNext={handleNext}
      />

      {/* Image Grid */}
      <GalleryImageGrid
        mediaAssets={mediaAssets}
        selectedImages={selectedImage}
        onToggleSelection={toggleImageSelection}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        imageSize={imageSize}
      />
    </SafeAreaView>
  );
};

export default ProfileGallerySelectScreen;
