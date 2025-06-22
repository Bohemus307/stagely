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
import { useAddIncidentImages } from "@/hooks/incidents/useAddIncidentImages";

import { useCreateIncident } from "@/hooks/incidents/useCreateIncident";
import { useS3Upload } from "@/hooks/useS3Upload";

interface SelectedImage {
  id: string;
  uri: string;
  selected: boolean;
}

interface IncidentImageData {
  imageUrl: string;
  caption?: string;
  takenAt?: string;
  metadata?: Record<string, any>;
}

const IncidentGallerySelectScreen = () => {
  const params = useLocalSearchParams();
  const incidentId = params.incidentId as string;
  const propertyId = params.propertyId as string;

  // Check if this is for a new incident or existing one
  const isNewIncident = !incidentId && propertyId;

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

  // Initialize hooks
  const {
    addImages,
    isPending: isAddingImages,
    isSuccess,
    data,
  } = useAddIncidentImages(incidentId || "");

  // Initialize S3 upload hook for new incidents
  const { uploadToS3 } = useS3Upload();

  // Initialize create incident hook
  const {
    createIncident,
    isPending: isCreatingIncident,
    isSuccess: isCreateSuccess,
    data: createdIncident,
  } = useCreateIncident();

  const windowWidth = Dimensions.get("window").width;
  const imageSize = (windowWidth - 24) / 3;

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

  // Effect to handle successful incident creation for new incidents
  useEffect(() => {
    if (isCreateSuccess && createdIncident && isNewIncident) {
      console.log(
        "[Effect] New incident created successfully, navigating to details",
      );
      console.log("[Effect] Created incident data:", createdIncident);

      // Add a small delay to ensure the API has processed everything
      setTimeout(() => {
        router.push({
          pathname: "/(tabs)/(incidents)/details",
          params: { incidentId: createdIncident.id.toString() },
        });
      }, 500);
    }
  }, [isCreateSuccess, createdIncident, isNewIncident]);

  // Effect to handle successful uploads for existing incidents
  useEffect(() => {
    if (isSuccess && data && !isNewIncident) {
      if (
        uploadProgress.completed === uploadProgress.total &&
        uploadProgress.total > 0
      ) {
        router.push({
          pathname: "/(tabs)/(incidents)/edit",
          params: { incidentId },
        });
      }
    }
  }, [isSuccess, uploadProgress, data, incidentId, isNewIncident]);

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
    const uriParts = uri.split("/");
    const fileName = uriParts[uriParts.length - 1];

    if (!fileName.includes(".")) {
      return `${fileName}.jpg`;
    }

    return fileName;
  };

  // Enhanced getImageBlob function (from your working example)
  const getImageBlob = async (uri: string): Promise<Blob> => {
    console.log(
      "[getImageBlob] Starting blob creation for URI:",
      uri.substring(0, 30) + "...",
    );

    const generateUniqueFileName = () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      return `temp_upload_image_${timestamp}_${random}.jpg`;
    };

    let tempFileUri: string | null = null;

    try {
      if (uri.startsWith("ph://")) {
        console.log(
          "[getImageBlob] Detected photo library URI, using FileSystem to read",
        );

        try {
          const assetId = uri.replace("ph://", "").split("/")[0];
          console.log("[getImageBlob] Extracted asset ID:", assetId);

          const asset = await MediaLibrary.getAssetInfoAsync(assetId);
          console.log("[getImageBlob] Got asset info:", {
            id: asset.id,
            hasLocalUri: !!asset.localUri,
            hasUri: !!asset.uri,
          });

          if (asset.localUri) {
            console.log("[getImageBlob] Using localUri instead of photo URI");
            uri = asset.localUri;
          }
        } catch (assetError) {
          console.log(
            "[getImageBlob] Could not get asset info, falling back to FileSystem:",
            assetError,
          );

          try {
            const uniqueFileName = generateUniqueFileName();
            tempFileUri = FileSystem.cacheDirectory + uniqueFileName;
            console.log(
              "[getImageBlob] Creating temporary file at:",
              tempFileUri,
            );

            const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
            if (fileInfo.exists) {
              console.log("[getImageBlob] File already exists, deleting it");
              await FileSystem.deleteAsync(tempFileUri);
            }

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
      throw error;
    } finally {
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
        }
      }
    }
  };

  const handleNext = async () => {
    const selectedImageArray = Array.from(selectedImages.values());

    console.log("[handleNext] Starting process", {
      selectedImagesCount: selectedImageArray.length,
      isNewIncident,
    });

    if (selectedImageArray.length === 0) {
      console.log("[handleNext] No images selected, aborting");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress({ completed: 0, total: selectedImageArray.length });

      if (isNewIncident) {
        // NEW INCIDENT FLOW: Upload to S3 first, then create incident automatically
        console.log("[handleNext] New incident flow - uploading to S3 first");

        const uploadedUrls: string[] = [];

        for (const [index, image] of selectedImageArray.entries()) {
          try {
            console.log(
              `[handleNext] Processing image ${index + 1}/${selectedImageArray.length}`,
            );

            // Get blob using the existing function that handles special URIs
            const blob = await getImageBlob(image.uri);
            const fileName = getImageFileName(image.uri);

            // Upload to S3 using the new hook
            console.log(`[handleNext] Uploading to S3: ${fileName}`);
            const publicUrl = await uploadToS3(blob, fileName);

            if (publicUrl) {
              uploadedUrls.push(publicUrl);
              console.log(
                `[handleNext] Successfully uploaded image ${index + 1}, URL:`,
                publicUrl,
              );
            }

            // Update progress
            setUploadProgress((prev) => ({
              ...prev,
              completed: index + 1,
            }));
          } catch (error) {
            console.error(
              `[handleNext] Error uploading image ${index + 1}:`,
              error,
            );
          }
        }

        if (uploadedUrls.length > 0) {
          console.log(
            "[handleNext] All uploads complete, creating incident automatically",
          );

          // Automatically create incident with uploaded images
          // Let AI handle the classification
          const incidentData = {
            propertyId: parseInt(propertyId),
            incidentType: "Pending Classification", // AI will classify
            description:
              "Incident reported with photos - awaiting AI classification",
            severity: "Medium" as const, // Default, AI may adjust
            status: "Open" as const,
            reportedAt: new Date().toISOString(),
            aiClassified: false, // Will be true after AI processes
            images: uploadedUrls.map((url, index) => ({
              imageUrl: url,
              caption: `Photo ${index + 1}`,
              takenAt: new Date().toISOString(),
              metadata: {
                source: "gallery_upload",
              },
            })),
          };

          console.log(
            "[handleNext] Creating incident with data:",
            incidentData,
          );
          createIncident(incidentData);
        } else {
          Alert.alert(
            "Upload Failed",
            "No images were uploaded successfully. Please try again.",
            [{ text: "OK" }],
          );
        }
      } else {
        // EXISTING INCIDENT FLOW: Add images to existing incident
        console.log(
          "[handleNext] Existing incident flow - adding images to incident",
        );

        const imagesToAdd: IncidentImageData[] = [];

        for (const [index, image] of selectedImageArray.entries()) {
          try {
            console.log(
              `[handleNext] Processing image ${index + 1}/${selectedImageArray.length}`,
            );

            // Get blob and upload to S3
            const blob = await getImageBlob(image.uri);
            const fileName = getImageFileName(image.uri);

            console.log(`[handleNext] Uploading to S3: ${fileName}`);
            const publicUrl = await uploadToS3(blob, fileName);

            if (publicUrl) {
              imagesToAdd.push({
                imageUrl: publicUrl,
                caption: `Image ${index + 1}`,
                takenAt: new Date().toISOString(),
                metadata: {
                  source: "device_gallery",
                  originalFileName: fileName,
                },
              });
            }

            setUploadProgress((prev) => ({
              ...prev,
              completed: index + 1,
            }));
          } catch (err) {
            console.error(
              `[handleNext] Error processing image ${index + 1}:`,
              err,
            );
          }
        }

        if (imagesToAdd.length > 0) {
          console.log(
            `[handleNext] Adding ${imagesToAdd.length} images to incident ${incidentId}`,
          );
          addImages(imagesToAdd);
        }
      }
    } catch (error) {
      console.error("[handleNext] Fatal error:", error);
      Alert.alert(
        "Upload Failed",
        "There was a problem uploading your images. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setUploading(false);
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

          <ThemedText className="text-lg font-medium">
            {isNewIncident ? "Select Photos" : "Select Photos"}
          </ThemedText>

          <Button
            variant="solid"
            disabled={
              selectedCount === 0 ||
              uploading ||
              isAddingImages ||
              isCreatingIncident
            }
            onPress={handleNext}
            className={`bg-primary-500`}
          >
            {uploading || isCreatingIncident ? (
              <Box className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white ml-2">
                  {isCreatingIncident
                    ? "Creating..."
                    : `${uploadProgress.completed}/${uploadProgress.total}`}
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

      {/* Upload Progress Indicator */}
      {(uploading || isCreatingIncident) && (
        <Box className="p-4 bg-gray-100 rounded-lg my-2">
          <ThemedText className="text-center">
            {isCreatingIncident
              ? "Creating incident with AI classification..."
              : isNewIncident
                ? `Uploading ${uploadProgress.completed} of ${uploadProgress.total} images...`
                : `Processing ${uploadProgress.completed} of ${uploadProgress.total} images...`}
          </ThemedText>
          {!isCreatingIncident && (
            <Box className="h-2 bg-gray-300 rounded-full mt-2">
              <Box
                className="h-2 bg-primary-500 rounded-full"
                style={{
                  width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
                }}
              />
            </Box>
          )}
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

export default IncidentGallerySelectScreen;
