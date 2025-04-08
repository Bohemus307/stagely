import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Text,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Button } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import BackButton from "@/components/BackButton";
import { useCreateSpace } from "@/hooks/spaces/useUploadAndCreateSpace";

interface SelectedImage {
  id: string;
  uri: string;
  selected: boolean;
}

const GallerySelectScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = Number(params.propertyId);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaLibrary.Asset[]>([]);
  const [selectedImages, setSelectedImages] = useState<
    Map<string, SelectedImage>
  >(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{
    completed: number;
    total: number;
  }>({ completed: 0, total: 0 });

  // Initialize the useCreateSpace hook
  const {
    uploadImageAndCreateSpace,
    isLoading: isSpaceCreationLoading,
    isSuccess,
    isError,
    data,
  } = useCreateSpace();

  const windowWidth = Dimensions.get("window").width;
  const imageSize = (windowWidth - 24) / 3; // 3 columns with 8px spacing between

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

  // Effect to handle successful space creation
  useEffect(() => {
    if (isSuccess && data) {
      // If all uploads are complete, navigate to a success screen or property details
      if (
        uploadProgress.completed === uploadProgress.total &&
        uploadProgress.total > 0
      ) {
        router.push({
          pathname: "/(tabs)/(properties)/(photos)",
          params: { propertyId: propertyId.toString() },
        });
      }
    }
  }, [isSuccess, uploadProgress, data, propertyId]);

  const loadMediaAssets = async () => {
    try {
      setLoading(true);
      // Get only photos (not videos)
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 100, // Increase number of photos for better UX
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
      const newSelectedImages = new Map(prevSelectedImages);

      if (newSelectedImages.has(asset.id)) {
        newSelectedImages.delete(asset.id);
      } else {
        newSelectedImages.set(asset.id, {
          id: asset.id,
          uri: asset.uri,
          selected: true,
        });
      }

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

  // Improved handleNext function with detailed logging
  const handleNext = async () => {
    // Convert map to array of selected images
    const selectedImageArray = Array.from(selectedImages.values());

    console.log("[handleNext] Starting upload process", {
      selectedImagesCount: selectedImageArray.length,
    });

    if (selectedImageArray.length === 0) {
      console.log("[handleNext] No images selected, aborting");
      return; // Don't proceed if no images selected
    }

    try {
      setUploading(true);
      setUploadProgress({ completed: 0, total: selectedImageArray.length });
      console.log(
        "[handleNext] Upload started, total images:",
        selectedImageArray.length,
      );

      // Process each image sequentially
      for (const [index, image] of selectedImageArray.entries()) {
        try {
          console.log(
            `[handleNext] Processing image ${index + 1}/${selectedImageArray.length}`,
            {
              imageId: image.id,
              imageUri: image.uri.substring(0, 30) + "...", // Truncate for logging
            },
          );

          // Get image info to determine file name and type
          console.log(`[handleNext] Getting file info for image ${index + 1}`);
          const imageInfo = await FileSystem.getInfoAsync(image.uri);
          console.log(`[handleNext] File info retrieved:`, {
            exists: imageInfo.exists,
            uri: imageInfo.uri?.substring(0, 30) + "...", // Truncate for logging
            ...(imageInfo.exists && {
              isDirectory: imageInfo.isDirectory,
              // Only include these properties if they exist
              ...("size" in imageInfo ? { size: imageInfo.size } : {}),
              ...("modificationTime" in imageInfo
                ? { modificationTime: imageInfo.modificationTime }
                : {}),
            }),
          });

          // Convert URI to blob for upload
          console.log(`[handleNext] Converting image ${index + 1} to blob`);
          let imageBlob;
          try {
            imageBlob = await getImageBlob(image.uri);
            console.log(`[handleNext] Blob created successfully:`, {
              type: imageBlob.type || "unknown",
              size: imageBlob.size,
            });
          } catch (blobError) {
            console.error(
              `[handleNext] Error creating blob for image ${index + 1}:`,
              blobError,
            );
            throw blobError;
          }
          const fileName = getImageFileName(image.uri);
          console.log(`[handleNext] Filename generated:`, { fileName });

          // Prepare metadata - only include size if available
          const metadata: Record<string, any> = {
            originalFileName: fileName,
            source: "device_gallery",
          };

          // Only add size if it exists in the file info
          if (imageInfo.exists && "size" in imageInfo) {
            metadata.size = imageInfo.size;
          }

          console.log(
            `[handleNext] Calling uploadImageAndCreateSpace for image ${index + 1}`,
            {
              propertyId,
              fileName,
              blobSize: imageBlob.size,
              blobType: imageBlob.type,
              metadata,
            },
          );

          // Upload image and create space
          const result = await uploadImageAndCreateSpace(
            propertyId,
            imageBlob,
            fileName,
            metadata,
          );

          console.log(`[handleNext] Successfully uploaded image ${index + 1}`, {
            spaceId: result?.id,
            imageUrl: result?.images?.[0]?.imageUrl?.substring(0, 30) + "...", // Truncate for logging
          });

          // Update progress
          setUploadProgress((prev) => ({
            ...prev,
            completed: index + 1,
          }));
          console.log(`[handleNext] Progress updated:`, {
            completed: index + 1,
            total: selectedImageArray.length,
          });
        } catch (err) {
          console.error(
            `[handleNext] Error uploading image ${index + 1}:`,
            err,
          );
          // More detailed error information
          if (err instanceof Error) {
            console.error(`[handleNext] Error details:`, {
              message: err.message,
              stack: err.stack,
              name: err.name,
            });
          }
          // Continue with next image even if one fails
        }
      }

      console.log("[handleNext] All uploads attempted, final status:", {
        isError,
        uploadProgress: `${uploadProgress.completed}/${uploadProgress.total}`,
      });

      // All uploads complete
      if (isError) {
        console.log("[handleNext] Showing error alert due to detected errors");
        Alert.alert(
          "Upload Error",
          "Some images could not be uploaded. Please try again.",
          [{ text: "OK" }],
        );
      } else {
        console.log("[handleNext] Upload process completed successfully");
      }
    } catch (error) {
      console.error("[handleNext] Fatal error in handleNext:", error);
      if (error instanceof Error) {
        console.error("[handleNext] Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      Alert.alert(
        "Upload Failed",
        "There was a problem uploading your images. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      console.log(
        "[handleNext] Upload process finished, resetting uploading state",
      );
      setUploading(false);
    }
  };

  // Enhanced getImageBlob function with photo library URI handling
  const getImageBlob = async (uri: string): Promise<Blob> => {
    console.log(
      "[getImageBlob] Starting blob creation for URI:",
      uri.substring(0, 30) + "...",
    );

    // Create a unique temporary file name for each image
    const generateUniqueFileName = () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      return `temp_upload_image_${timestamp}_${random}.jpg`;
    };

    let tempFileUri: string | null = null;

    try {
      // For photo library URIs (ph://) we need a different approach
      if (uri.startsWith("ph://")) {
        console.log(
          "[getImageBlob] Detected photo library URI, using FileSystem to read",
        );

        // First, try to get a file:// URI from the photo library
        try {
          // Extract asset ID from the ph:// URI
          const assetId = uri.replace("ph://", "").split("/")[0];
          console.log("[getImageBlob] Extracted asset ID:", assetId);

          // Try to get asset info with just the ID
          const asset = await MediaLibrary.getAssetInfoAsync(assetId);
          console.log("[getImageBlob] Got asset info:", {
            id: asset.id,
            hasLocalUri: !!asset.localUri,
            hasUri: !!asset.uri,
          });

          // If we have a localUri, use that instead of the original uri
          if (asset.localUri) {
            console.log("[getImageBlob] Using localUri instead of photo URI");
            uri = asset.localUri;
          }
        } catch (assetError) {
          console.log(
            "[getImageBlob] Could not get asset info, falling back to FileSystem:",
            assetError,
          );

          // As a fallback, try to read the image data using FileSystem
          try {
            const uniqueFileName = generateUniqueFileName();
            tempFileUri = FileSystem.cacheDirectory + uniqueFileName;
            console.log(
              "[getImageBlob] Creating temporary file at:",
              tempFileUri,
            );

            // First check if the file exists and delete it if it does
            const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
            if (fileInfo.exists) {
              console.log("[getImageBlob] File already exists, deleting it");
              await FileSystem.deleteAsync(tempFileUri);
            }

            // Copy the photo to a temporary file
            await FileSystem.copyAsync({
              from: uri,
              to: tempFileUri,
            });

            console.log("[getImageBlob] Successfully copied to temporary file");
            uri = tempFileUri;
          } catch (copyError) {
            console.error("[getImageBlob] Error copying file:", copyError);
            throw copyError;
          }
        }
      }

      console.log(
        "[getImageBlob] Fetching from URI:",
        uri.substring(0, 30) + "...",
      );
      const response = await fetch(uri);
      console.log("[getImageBlob] Fetch response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
      }

      const blob = await response.blob();
      console.log("[getImageBlob] Blob created successfully:", {
        size: blob.size,
        type: blob.type || "unknown",
      });

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
      // Clean up temporary file if it was created
      if (tempFileUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
          if (fileInfo.exists) {
            console.log(
              "[getImageBlob] Cleaning up temporary file:",
              tempFileUri,
            );
            await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
          }
        } catch (cleanupError) {
          console.log("[getImageBlob] Error during cleanup:", cleanupError);
          // Don't throw here, as we're in finally block
        }
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderImageItem = ({ item }: { item: MediaLibrary.Asset }) => {
    const isSelected = selectedImages.has(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleImageSelection(item)}
        style={{
          width: imageSize,
          height: imageSize,
          margin: 4,
        }}
        className={`rounded-lg overflow-hidden ${isSelected ? "border-4 border-primary-500" : ""}`}
      >
        <Image source={{ uri: item.uri }} className="w-full h-full" />
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
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" className="text-primary-500" />
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center p-4">
        <ThemedText className="text-lg text-center mb-4">
          Media library access is required to select photos.
        </ThemedText>
        <Button onPress={handleBack}>
          <ThemedText className="text-white">Go Back</ThemedText>
        </Button>
      </SafeAreaView>
    );
  }

  const selectedCount = selectedImages.size;

  return (
    <SafeAreaView className="flex-1 p-4">
      {/* Header */}
      <Box className="px-2 py-2 border-b border-gray-200">
        <Box className="flex-row justify-between items-center">
          <BackButton />

          <ThemedText className="text-lg font-medium">Select Photos</ThemedText>

          <Button
            variant="solid"
            disabled={
              selectedCount === 0 || uploading || isSpaceCreationLoading
            }
            onPress={handleNext}
            className={`bg-primary-500`}
          >
            {uploading ? (
              <Box className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white ml-2">
                  {uploadProgress.completed + 1}/{uploadProgress.total}
                </Text>
              </Box>
            ) : (
              <Text className="text-white">
                Next {selectedCount > 0 ? `(${selectedCount})` : ""}
              </Text>
            )}
          </Button>
        </Box>
      </Box>

      {/* Upload Progress Indicator (shows when uploading) */}
      {uploading && (
        <Box className="p-4 bg-gray-100 rounded-lg my-2">
          <ThemedText className="text-center">
            Uploading {uploadProgress.completed + 1} of {uploadProgress.total}{" "}
            images...
          </ThemedText>
          <Box className="h-2 bg-gray-300 rounded-full mt-2">
            <Box
              className="h-2 bg-primary-500 rounded-full"
              style={{
                width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
              }}
            />
          </Box>
        </Box>
      )}

      {/* Image Grid */}
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
      />
    </SafeAreaView>
  );
};

export default GallerySelectScreen;
