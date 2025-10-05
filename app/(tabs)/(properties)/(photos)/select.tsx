import React, { useState, useEffect } from "react";
import { SafeAreaView, Dimensions, Alert, Modal } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { useCreateSpace } from "@/hooks/spaces/useUploadAndCreateSpace";
import ProcessingScreen from "@/components/photos/room-detection/ProcessingScreen";
import RoomDetectionCard from "@/components/photos/room-detection/RoomDetectionCard";
import SuccessAnimation from "@/components/photos/room-detection/SuccessAnimation";
import GalleryHeader from "@/components/photos/GalleryHeader";
import GalleryImageGrid from "@/components/photos/GalleryImageGrid";
import GalleryPermissionDenied from "@/components/photos/GalleryPermissionDenied";
import GalleryLoadingState from "@/components/photos/GalleryLoadingState";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";

interface SelectedImage {
  id: string;
  uri: string;
  selected: boolean;
}

interface UploadResult {
  imageUri: string;
  spaceData: any;
  confirmedRoomType?: string;
  updatedLabels?: any[];
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

  // New state for room detection flow
  const [currentStep, setCurrentStep] = useState<
    "selecting" | "processing" | "confirming" | "success"
  >("selecting");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");

  // Initialize the useCreateSpace hook
  const { uploadImageAndCreateSpace, isLoading: isSpaceCreationLoading } =
    useCreateSpace();

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

  const loadMediaAssets = async () => {
    try {
      setLoading(true);
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 10,
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

  // Enhanced getImageBlob function
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
        }
      }
    }
  };

  const updateProgressWithDelay = async (
    progress: number,
    status: string,
    delay: number = 300,
  ) => {
    setProcessingStatus(status);
    setProcessingProgress(progress);
    await new Promise((resolve) => setTimeout(resolve, delay));
  };

  const handleNext = async () => {
    const selectedImageArray = Array.from(selectedImages.values());

    if (selectedImageArray.length === 0) {
      return;
    }

    setCurrentStep("processing");
    setUploadResults([]);
    setCurrentImageIndex(0);
    setProcessingProgress(0);

    // Track results locally during processing
    const localUploadResults: UploadResult[] = [];

    try {
      // Process each image
      for (const [index, image] of selectedImageArray.entries()) {
        try {
          setCurrentImageIndex(index);

          const baseProgress = (index / selectedImageArray.length) * 100;
          const stepProgress = 100 / selectedImageArray.length;
          const isLastImage = index === selectedImageArray.length - 1;

          // Step 1: Preparing image (0-20% of this image's progress)
          await updateProgressWithDelay(
            baseProgress + stepProgress * 0.1,
            "Preparing image...",
          );

          // Get image info
          const imageInfo = await FileSystem.getInfoAsync(image.uri);

          // Step 2: Converting image (20-40% of this image's progress)
          await updateProgressWithDelay(
            baseProgress + stepProgress * 0.3,
            "Converting image for upload...",
          );

          // Convert URI to blob
          const imageBlob = await getImageBlob(image.uri);
          const fileName = getImageFileName(image.uri);

          // Prepare metadata
          const metadata: Record<string, any> = {
            originalFileName: fileName,
            source: "device_gallery",
          };

          if (imageInfo.exists && "size" in imageInfo) {
            metadata.size = imageInfo.size;
          }

          // Step 3: Uploading image (40-70% of this image's progress)
          await updateProgressWithDelay(
            baseProgress + stepProgress * 0.5,
            "Uploading image to server...",
          );

          // Upload image and create space
          const result = await uploadImageAndCreateSpace(
            propertyId,
            imageBlob,
            fileName,
            metadata,
          );

          // Step 4: Processing with AI (70-90% of this image's progress)
          await updateProgressWithDelay(
            baseProgress + stepProgress * 0.8,
            "Analyzing room with AI...",
          );

          // Store the result locally and in state
          const uploadResult: UploadResult = {
            imageUri: image.uri,
            spaceData: result,
          };

          localUploadResults.push(uploadResult);

          setUploadResults((prev) => [...prev, uploadResult]);

          // Complete this image
          await updateProgressWithDelay(
            baseProgress + stepProgress * 0.95,
            "Finalizing...",
          );

          setProcessingProgress(baseProgress + stepProgress);

          // If this is the last image, show final status
          if (isLastImage) {
            await updateProgressWithDelay(100, "Processing complete!", 500);
          }

          // Don't show confirmation during the loop - we'll handle it after all uploads
        } catch (err) {
          console.error(`Error uploading image ${index + 1}:`, err);
          // Continue with next image
        }
      }

      // After all images are processed, decide what to do next
      if (localUploadResults.length > 0) {
        // Small delay before transitioning
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCurrentStep("confirming");
        setCurrentImageIndex(0);
      } else {
        // No successful uploads
        Alert.alert(
          "Upload Failed",
          "No images were uploaded successfully. Please try again.",
          [{ text: "OK", onPress: () => setCurrentStep("selecting") }],
        );
      }
    } catch (error) {
      console.error("Fatal error in handleNext:", error);
      Alert.alert(
        "Upload Failed",
        "There was a problem uploading your images. Please try again.",
        [{ text: "OK", onPress: () => setCurrentStep("selecting") }],
      );
    }
  };
  // needs to use the hook to update the space @TODO:
  const handleRoomConfirmation = async (updatedSpace?: any) => {
    console.log(
      "Room confirmed with updated space:",
      updatedSpace,
      "for image",
      currentImageIndex,
    );

    // Store the updated space data for this image
    setUploadResults((prev) => {
      const updated = [...prev];
      if (updated[currentImageIndex] && updatedSpace) {
        updated[currentImageIndex] = {
          ...updated[currentImageIndex],
          spaceData: updatedSpace, // Replace with updated space data
          confirmedRoomType: updatedSpace.type,
        };
      }
      return updated;
    });

    // Move to next image or complete
    if (currentImageIndex < uploadResults.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setCurrentStep("success");
    }
  };

  const handleSuccessComplete = () => {
    router.dismissAll();
  };

  const handleBack = () => {
    if (currentStep === "selecting") {
      router.back();
    } else {
      setCurrentStep("selecting");
    }
  };

  if (hasPermission === null || loading) {
    return <GalleryLoadingState />;
  }

  if (hasPermission === false) {
    return <GalleryPermissionDenied onBack={handleBack} />;
  }

  const selectedCount = selectedImages.size;

  // Show processing screen
  if (currentStep === "processing") {
    return (
      <Modal animationType="slide" presentationStyle="fullScreen">
        <ProcessingScreen
          progress={processingProgress}
          currentStatus={processingStatus}
          totalImages={selectedImages.size}
          currentImage={currentImageIndex + 1}
        />
      </Modal>
    );
  }

  // Show room confirmation
  if (currentStep === "confirming" && uploadResults[currentImageIndex]) {
    const currentResult = uploadResults[currentImageIndex];
    const spaceData = currentResult.spaceData;

    return (
      <Modal animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView className="flex-1">
          <RoomDetectionCard
            imageUri={currentResult.imageUri}
            detectedRoom={spaceData?.type || "other"}
            confidence={
              spaceData?.confidenceScore
                ? parseFloat(spaceData.confidenceScore) * 100
                : 50
            }
            objectLabels={spaceData?.objectLabels || []}
            onConfirm={handleRoomConfirmation}
            onCancel={() => setCurrentStep("selecting")}
            spaceId={spaceData?.id?.toString() || ""}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  // Show success animation
  if (currentStep === "success") {
    const confirmedRoom = uploadResults[0];

    console.log("Success screen - showing room type:", confirmedRoom);
    console.log(
      "Upload results:",
      uploadResults.map((r) => ({
        confirmed: r.confirmedRoomType,
        detected: r.spaceData?.type,
      })),
    );
    console.log("ROOM", confirmedRoom);
    return (
      <Modal animationType="fade" presentationStyle="fullScreen">
        <SuccessAnimation
          roomType={confirmedRoom.spaceData.name}
          imageCount={uploadResults.length}
          onComplete={handleSuccessComplete}
        />
      </Modal>
    );
  }

  return (
    <ResponsiveScreenWrapper scrollable={true}>
      <SafeAreaView className="flex-1 p-4 mt-4">
        {/* Header */}
        <GalleryHeader
          selectedCount={selectedCount}
          isLoading={isSpaceCreationLoading}
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
    </ResponsiveScreenWrapper>
  );
};

export default GallerySelectScreen;
