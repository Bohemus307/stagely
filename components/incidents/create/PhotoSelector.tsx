import React, { useState } from "react";
import {
  ScrollView,
  Pressable,
  Dimensions,
  Alert,
  Text,
  Modal,
  SafeAreaView,
} from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { Image } from "react-native";
import { Colors } from "@/constants/Colors";
import {
  Property,
  PropertyImage,
  PropertySpace,
} from "@/lib/@types/properties";
import { getCloudFrontUrl } from "@/app/(tabs)/(properties)/(photos)/details";
import { GalleryGrid } from "@/components/incidents/create/selectGallery";
import { useCreateSpace } from "@/hooks/spaces/useUploadAndCreateSpace";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import ProcessingScreen from "@/components/photos/room-detection/ProcessingScreen";
import RoomDetectionCard from "@/components/photos/room-detection/RoomDetectionCard";
import { ObjectLabel } from "@/hooks/spaces/useUpdatePropertySpace";

export interface PhotoOption {
  id: number;
  uri: string;
  type?: string;
  spaceId?: number;
  spaceName?: string;
  takenAt?: string;
  analysisData?: any;
  propertyId?: number;
  name?: string;
  aiGenerated?: boolean;
  featureVector?: any;
  confidenceScore?: number;
  createdAt?: string;
  updatedAt?: string;
  objectLabels?: ObjectLabel[];
  property?: Property;
  images?: PropertyImage[];
}

interface PhotoSelectorProps {
  selectedPhoto: PhotoOption | null;
  onSelectPhoto: (photo: PhotoOption) => void;
  onTakePhoto: () => void;
  onSelectFromGallery?: () => void;
  propertySpaces?: PropertySpace[];
  recentPhotos?: PhotoOption[];
  propertyId: number;
  enableAnalysis?: boolean;
}

export const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  selectedPhoto,
  onSelectPhoto,
  onTakePhoto,
  propertySpaces = [],
  recentPhotos = [],
  propertyId,
  enableAnalysis = true,
}) => {
  const [selectedTab, setSelectedTab] = useState<"new" | "existing">("new");
  const [showGallery, setShowGallery] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "selecting" | "processing" | "confirming" | "complete"
  >("selecting");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [pendingPhoto, setPendingPhoto] = useState<PhotoOption | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const screenWidth = Dimensions.get("window").width;
  const imageSize = screenWidth / 3;

  // Initialize the useCreateSpace hook
  const { uploadImageAndCreateSpace } = useCreateSpace();

  // Get space icon based on type
  const getSpaceIcon = (spaceType?: string): IconSymbolName => {
    switch (spaceType) {
      case "Kitchen":
        return "fork.knife";
      case "Bathroom":
        return "drop.fill";
      case "Bedroom":
        return "bed.double.fill";
      case "LivingRoom":
        return "sofa.fill";
      case "Garage":
        return "car.fill";
      case "Exterior":
        return "house.fill";
      default:
        return "square.grid.2x2";
    }
  };

  // Helper function to get image blob (copied from GallerySelectScreen)
  const getImageBlob = async (uri: string): Promise<Blob> => {
    console.log(
      "[getImageBlob] Starting blob creation for URI:",
      uri.substring(0, 30) + "...",
    );

    const generateUniqueFileName = () => {
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      return `temp_incident_image_${timestamp}_${random}.jpg`;
    };

    let tempFileUri: string | null = null;

    try {
      if (uri.startsWith("ph://")) {
        console.log("[getImageBlob] Detected photo library URI");

        try {
          const assetId = uri.replace("ph://", "").split("/")[0];
          const asset = await MediaLibrary.getAssetInfoAsync(assetId);

          if (asset.localUri) {
            uri = asset.localUri;
          }
        } catch (assetError) {
          console.log(
            "[getImageBlob] Could not get asset info, using FileSystem",
            assetError,
          );

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
        }
      }

      const response = await fetch(uri);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error("[getImageBlob] Error creating blob:", error);
      throw error;
    } finally {
      if (tempFileUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
          }
        } catch (cleanupError) {
          console.log("[getImageBlob] Error during cleanup:", cleanupError);
        }
      }
    }
  };

  const getImageFileName = (uri: string): string => {
    const uriParts = uri.split("/");
    const fileName = uriParts[uriParts.length - 1];

    if (!fileName.includes(".")) {
      return `${fileName}.jpg`;
    }

    return fileName;
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

  // Handle photo analysis when selected from gallery
  const handleGalleryPhotoSelect = async (uri: string) => {
    const newPhoto: PhotoOption = {
      id: Date.now(),
      uri: uri,
      type: "gallery",
      takenAt: new Date().toISOString(),
    };

    if (enableAnalysis) {
      // Start analysis flow
      setPendingPhoto(newPhoto);
      setCurrentStep("processing");
      await analyzePhoto(newPhoto);
    } else {
      // Direct selection without analysis
      onSelectPhoto(newPhoto);
      setShowGallery(false);
    }
  };

  // Analyze photo using the space creation endpoint
  const analyzePhoto = async (photo: PhotoOption) => {
    try {
      // Update progress
      await updateProgressWithDelay(10, "Preparing image for analysis...");

      // Get image info
      const imageInfo = await FileSystem.getInfoAsync(photo.uri);

      await updateProgressWithDelay(30, "Converting image...");

      // Convert to blob
      const imageBlob = await getImageBlob(photo.uri);
      const fileName = getImageFileName(photo.uri);

      // Prepare metadata for incident context
      const metadata: Record<string, any> = {
        originalFileName: fileName,
        source: "incident_report",
        isIncidentPhoto: true,
      };

      if (imageInfo.exists && "size" in imageInfo) {
        metadata.size = imageInfo.size;
      }

      await updateProgressWithDelay(50, "Uploading and analyzing with AI...");

      // Use the space creation hook for analysis
      const result = await uploadImageAndCreateSpace(
        propertyId,
        imageBlob,
        fileName,
        metadata,
      );
      console.log("SPACE R$SUL:T ", result);
      await updateProgressWithDelay(80, "Processing AI results...");

      // Store the analysis result
      setAnalysisResult(result);

      // Update the photo with analysis data
      const analyzedPhoto: PhotoOption = {
        ...photo,
        id: result.id,
        analysisData: result,
      };

      setPendingPhoto(analyzedPhoto);

      await updateProgressWithDelay(100, "Analysis complete!");

      // Wait a bit before showing confirmation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show confirmation screen
      setCurrentStep("confirming");
    } catch (error) {
      console.error("Error analyzing photo:", error);
      Alert.alert(
        "Analysis Failed",
        "Unable to analyze the photo. Would you like to use it anyway?",
        [
          {
            text: "Cancel",
            onPress: () => {
              setCurrentStep("selecting");
              setShowGallery(false);
            },
            style: "cancel",
          },
          {
            text: "Use Anyway",
            onPress: () => {
              onSelectPhoto(photo);
              setCurrentStep("selecting");
              setShowGallery(false);
            },
          },
        ],
      );
    }
  };

  // Handle room confirmation from the detection card
  const handleRoomConfirmation = async (updatedSpace?: any) => {
    if (pendingPhoto) {
      const finalPhoto: PhotoOption = {
        ...pendingPhoto,
        analysisData: updatedSpace || analysisResult,
      };

      onSelectPhoto(finalPhoto);

      // Reset states
      setCurrentStep("selecting");
      setShowGallery(false);
      setPendingPhoto(null);
      setAnalysisResult(null);
    }
  };

  // Handle cancellation of analysis
  const handleAnalysisCancel = () => {
    setCurrentStep("selecting");
    setPendingPhoto(null);
    setAnalysisResult(null);
  };

  // Show processing screen during analysis
  if (currentStep === "processing") {
    return (
      <Modal animationType="slide" presentationStyle="fullScreen">
        <ProcessingScreen
          progress={processingProgress}
          currentStatus={processingStatus}
          totalImages={1}
          currentImage={1}
        />
      </Modal>
    );
  }

  // Show room/incident confirmation
  if (currentStep === "confirming" && pendingPhoto && analysisResult) {
    return (
      <Modal animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView className="flex-1">
          <RoomDetectionCard
            imageUri={pendingPhoto.uri}
            detectedRoom={analysisResult?.type || "other"}
            confidence={
              analysisResult?.confidenceScore
                ? parseFloat(analysisResult.confidenceScore) * 100
                : 50
            }
            objectLabels={analysisResult?.objectLabels || []}
            onConfirm={handleRoomConfirmation}
            onCancel={handleAnalysisCancel}
            spaceId={analysisResult?.id?.toString() || ""}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Box className="flex-1">
      {/* Tab Selector */}
      <HStack className="px-4 mb-4">
        <Pressable
          onPress={() => setSelectedTab("new")}
          className={`flex-1 py-3 rounded-l-lg ${
            selectedTab === "new" ? "bg-primary-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-center font-medium ${
              selectedTab === "new" ? "text-white" : "text-gray-700"
            }`}
          >
            Take New Photo
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSelectedTab("existing")}
          className={`flex-1 py-3 rounded-r-lg ${
            selectedTab === "existing" ? "bg-primary-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-center font-medium ${
              selectedTab === "existing" ? "text-white" : "text-gray-700"
            }`}
          >
            Use Existing Photo
          </Text>
        </Pressable>
      </HStack>

      {selectedTab === "new" ? (
        // New Photo Options
        showGallery ? (
          // Show gallery full screen when selected
          <Box className="flex-1 px-4">
            <HStack className="justify-between items-center mb-3">
              <ThemedText className="text-sm font-semibold text-gray-600">
                SELECT FROM GALLERY
              </ThemedText>
              <Pressable onPress={() => setShowGallery(false)} className="p-2">
                <IconSymbol
                  name="xmark.circle.fill"
                  size={24}
                  color="#6B7280"
                />
              </Pressable>
            </HStack>
            <Box className="flex-1">
              <GalleryGrid
                onSelectPhoto={handleGalleryPhotoSelect}
                selectedPhotoUri={selectedPhoto?.uri}
              />
            </Box>
          </Box>
        ) : (
          <ScrollView className="flex-1">
            <Box className="px-4">
              <Pressable
                onPress={onTakePhoto}
                className="bg-gradient-to-r from-blue-500 to-primary-500 rounded-xl overflow-hidden mb-4"
              >
                <Box className="flex-row items-center py-5 px-4">
                  <Box className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center mr-4">
                    <IconSymbol
                      name="camera.fill"
                      size={28}
                      color={Colors.light.tabIconSelected}
                    />
                  </Box>
                  <VStack className="flex-1">
                    <ThemedText className="text-lg font-semibold">
                      Open Camera
                    </ThemedText>
                    <ThemedText className="text-sm text-white/80">
                      Take a photo of the incident
                    </ThemedText>
                  </VStack>
                  <IconSymbol
                    name="chevron.right"
                    size={20}
                    color={Colors.light.tabIconSelected}
                  />
                </Box>
              </Pressable>

              <Pressable
                onPress={() => setShowGallery(true)}
                className="bg-gray-100 rounded-xl overflow-hidden mb-4"
              >
                <Box className="flex-row items-center py-5 px-4">
                  <Box className="w-14 h-14 bg-gray-200 rounded-full justify-center items-center mr-4">
                    <IconSymbol
                      name="photo.on.rectangle"
                      size={28}
                      color={Colors.light.tabIconSelected}
                    />
                  </Box>
                  <VStack className="flex-1">
                    <ThemedText className="text-lg font-semibold">
                      Choose from Gallery
                    </ThemedText>
                    <ThemedText className="text-sm text-gray-600">
                      Select from your device photos
                    </ThemedText>
                  </VStack>
                  <IconSymbol
                    name="chevron.right"
                    size={20}
                    color={Colors.light.tabIconSelected}
                  />
                </Box>
              </Pressable>

              {/* AI Analysis Info */}
              <Box className="bg-primary-50 p-4 rounded-lg">
                <HStack className="items-start">
                  <IconSymbol
                    name="sparkles"
                    size={20}
                    color={Colors.light.tint}
                  />
                  <VStack className="ml-3 flex-1">
                    <ThemedText className="font-semibold text-sm mb-1">
                      AI-Powered Analysis
                    </ThemedText>
                    <ThemedText className="text-xs text-gray-600 leading-5">
                      After taking or selecting a photo, our AI will
                      automatically detect the type of incident, identify the
                      affected area, and suggest severity level to help you
                      report faster.
                    </ThemedText>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </ScrollView>
        )
      ) : (
        // Existing Photos tab (unchanged)
        <ScrollView className="flex-1">
          <Box className="px-4">
            {/* Property Spaces Grid */}
            {propertySpaces.length > 0 && (
              <>
                <ThemedText className="text-sm font-semibold text-gray-600 mb-3">
                  PROPERTY PHOTOS
                </ThemedText>

                <Box className="flex-row flex-wrap justify-center">
                  {propertySpaces.map((space) => (
                    <Pressable
                      key={space.id}
                      onPress={() => {
                        if (space.images && space.images.length > 0) {
                          onSelectPhoto({
                            id: space.id,
                            uri:
                              getCloudFrontUrl(space.images[0].imageUrl) ||
                              space.images[0].imageUrl,
                            type: space.type,
                            spaceId: space.id,
                            spaceName: space.name,
                          });
                        } else {
                          Alert.alert(
                            "No Photos",
                            "This space has no photos yet",
                          );
                        }
                      }}
                      style={{
                        width: imageSize,
                        height: imageSize,
                        margin: 10,
                      }}
                    >
                      {space.images && space.images.length > 0 ? (
                        <Image
                          source={{
                            uri:
                              getCloudFrontUrl(space.images[0].imageUrl) ||
                              space.images[0].imageUrl,
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: 8,
                            borderWidth:
                              selectedPhoto?.spaceId === space.id ? 4 : 0,
                            borderColor: "#3B82F6",
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Box
                          style={{
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#f3f4f6",
                            borderRadius: 8,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <IconSymbol
                            name={getSpaceIcon(space.type)}
                            size={32}
                            color={Colors.light.tabIconDefault}
                          />
                        </Box>
                      )}
                    </Pressable>
                  ))}
                </Box>
              </>
            )}

            {/* Empty State */}
            {recentPhotos.length === 0 && propertySpaces.length === 0 && (
              <Box className="flex-1 justify-center items-center py-12">
                <IconSymbol
                  name="photo"
                  size={48}
                  color={Colors.light.tabIconDefault}
                />
                <ThemedText className="text-lg font-semibold mt-4">
                  No Photos Available
                </ThemedText>
                <ThemedText className="text-center text-gray-600 mt-2">
                  Take a new photo to document this incident
                </ThemedText>
              </Box>
            )}
          </Box>
        </ScrollView>
      )}
    </Box>
  );
};
