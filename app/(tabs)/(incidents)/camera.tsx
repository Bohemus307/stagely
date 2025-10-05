import { useState, useEffect, useRef } from "react";
import { View, Text, Alert, SafeAreaView } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraType,
  FlashMode,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { useRouter } from "expo-router";
import { useAddIncidentImages } from "@/hooks/incidents/useAddIncidentImages";
import useS3ImageUpload from "@/hooks/useImageUpload";
import { useCreateIncident } from "@/hooks/incidents/useCreateIncident";

interface CapturedPhoto {
  id: string;
  uri: string;
  timestamp: string;
}

export default function IncidentCameraScreen(): React.ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams<{
    propertyId: string;
    incidentId?: string;
  }>();
  const propertyId = params.propertyId;
  const incidentId = params.incidentId;
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const {
    addImages,
    isPending: isAddingImages,
    isSuccess: isAddImagesSuccess,
  } = useAddIncidentImages(incidentId || "");

  const { uploadToS3 } = useS3ImageUpload();

  const {
    createIncident,
    isPending: isCreatingIncident,
    isSuccess: isCreateSuccess,
    data: createdIncident,
  } = useCreateIncident();

  // React to add images success
  useEffect(() => {
    if (isAddImagesSuccess && incidentId) {
      router.push({
        pathname: `/(tabs)/(incidents)/details`,
        params: { incidentId },
      });
    }
  }, [isAddImagesSuccess, incidentId, router]);

  // React to create incident success
  useEffect(() => {
    if (isCreateSuccess && createdIncident && !incidentId) {
      console.log("New incident created, navigating to details");
      router.push({
        pathname: "/(tabs)/(incidents)/details",
        params: { incidentId: createdIncident.id.toString() },
      });
    }
  }, [isCreateSuccess, createdIncident, incidentId, router]);

  // Request permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (!permission?.granted) {
          const cameraResult = await requestPermission();
          if (!cameraResult.granted) {
            Alert.alert(
              "Permission Required",
              "Camera access is required for this feature.",
              [{ text: "Go Back", onPress: () => router.back() }],
            );
            return;
          }
        }

        const mediaResult = await MediaLibrary.requestPermissionsAsync();
        if (mediaResult.status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Media library access is required to save photos.",
          );
        }
      } catch (error) {
        console.error("Permission request error:", error);
      }
    };

    requestPermissions();
  }, [permission, requestPermission, router]);

  const takePhoto = async (): Promise<void> => {
    if (!cameraRef.current || isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });

      if (!photo || !photo.uri) {
        throw new Error("Failed to capture photo");
      }

      const newPhoto: CapturedPhoto = {
        id: `photo-${Date.now()}`,
        uri: photo.uri,
        timestamp: new Date().toISOString(),
      };

      setCapturedPhotos((prev) => [...prev, newPhoto]);
    } catch (error) {
      console.error("Photo capture error:", error);
      Alert.alert(
        "Error",
        `Failed to take photo: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleFlash = (): void => {
    setFlashMode((prev) => (prev === "off" ? "on" : "off"));
  };

  const toggleCameraType = (): void => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
  };

  const uploadPhotosToIncident = async (): Promise<void> => {
    if (capturedPhotos.length === 0 || !incidentId) {
      return;
    }

    try {
      setUploading(true);

      const imageData = await Promise.all(
        capturedPhotos.map(async (photo) => {
          const fileInfo = await FileSystem.getInfoAsync(photo.uri);

          return {
            imageUrl: photo.uri,
            caption: "",
            takenAt: photo.timestamp,
            metadata: {
              size:
                fileInfo.exists && "size" in fileInfo
                  ? fileInfo.size
                  : undefined,
              source: "camera",
            },
          };
        }),
      );

      addImages(imageData);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Error", "Failed to upload photos. Please try again.");
      setUploading(false);
    }
  };

  const continueToIncidentDetails = async (): Promise<void> => {
    if (capturedPhotos.length === 0) {
      Alert.alert(
        "No Photos",
        "Please take at least one photo before continuing.",
      );
      return;
    }

    if (incidentId) {
      uploadPhotosToIncident();
    } else {
      // For new incidents, upload photos to S3 first
      setUploading(true);
      try {
        const uploadedUrls: string[] = [];

        for (const photo of capturedPhotos) {
          try {
            const response = await fetch(photo.uri);
            const blob = await response.blob();

            const reader = new FileReader();
            const base64 = await new Promise<string>((resolve, reject) => {
              reader.onerror = reject;
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  const base64Data = reader.result.split(",")[1];
                  resolve(base64Data);
                } else {
                  reject(new Error("Failed to convert to base64"));
                }
              };
              reader.readAsDataURL(blob);
            });

            const result = await uploadToS3({
              uri: photo.uri,
              base64: base64,
              width: 0,
              height: 0,
              type: "image/jpeg",
              fileName: `incident_photo_${Date.now()}.jpg`,
            });

            if (result?.url) {
              uploadedUrls.push(result.url);
            }
          } catch (error) {
            console.error("Error uploading photo:", error);
          }
        }

        if (uploadedUrls.length > 0) {
          createIncident({
            propertyId: parseInt(propertyId || "0"),
            incidentType: "Pending Classification",
            description:
              "Incident reported with photos - awaiting AI classification",
            severity: "Medium" as const,
            status: "Open" as const,
            reportedAt: new Date().toISOString(),
            aiClassified: false,
            images: uploadedUrls.map((url, index) => ({
              imageUrl: url,
              caption: `Photo ${index + 1}`,
              takenAt:
                capturedPhotos[index]?.timestamp || new Date().toISOString(),
              metadata: {
                source: "camera",
              },
            })),
            userId: 0,
          });
        } else {
          Alert.alert(
            "Upload Failed",
            "Failed to upload photos. Please try again.",
          );
        }
      } finally {
        setUploading(false);
      }
    }
  };

  const handleBack = (): void => {
    if (capturedPhotos.length > 0) {
      Alert.alert("Discard Photos?", "All captured photos will be lost.", [
        { text: "Cancel", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-background-950">
        <View className="flex-1 justify-center items-center">
          <Text className="text-typography-50">Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background-950">
        <View className="flex-1 justify-center items-center px-6">
          <IconSymbol name="camera.fill" size={48} color="gray" />
          <Text className="text-typography-50 text-center mt-4 text-lg">
            Camera Access Required
          </Text>
          <Text className="text-typography-400 text-center mt-2">
            Please enable camera permissions to capture incident photos.
          </Text>
          <Button className="mt-6" onPress={requestPermission}>
            <ButtonText>Grant Permission</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />

      <View className="flex-1">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={cameraType}
          flash={flashMode}
        >
          <View className="flex-1 justify-between">
            {/* Top bar */}
            <HStack className="w-full justify-between items-center px-4 pt-12 pb-2 bg-black/30">
              <Button
                variant="outline"
                onPress={handleBack}
                className="bg-black/40 rounded-full w-10 h-10 justify-center items-center"
              >
                <IconSymbol name="chevron.left" size={20} color="white" />
              </Button>

              <Text className="text-white font-semibold">
                {capturedPhotos.length}{" "}
                {capturedPhotos.length === 1 ? "Photo" : "Photos"}
              </Text>

              <Button
                variant="outline"
                onPress={toggleFlash}
                className="bg-black/40 rounded-full w-10 h-10 justify-center items-center"
              >
                <IconSymbol
                  name={flashMode === "on" ? "bolt.fill" : "bolt"}
                  size={20}
                  color="white"
                />
              </Button>
            </HStack>

            {/* Camera controls */}
            <View className="pb-8 bg-black/30">
              <HStack className="w-full justify-around items-center pb-4">
                <Button
                  variant="outline"
                  onPress={toggleCameraType}
                  disabled={isCapturing}
                  className="bg-black/40 rounded-full w-12 h-12 justify-center items-center"
                >
                  <IconSymbol name="camera.rotate" size={24} color="white" />
                </Button>

                <Button
                  variant="outline"
                  onPress={takePhoto}
                  disabled={isCapturing}
                  className={`bg-white rounded-full w-20 h-20 justify-center items-center border-4 border-primary-500 ${
                    isCapturing ? "opacity-50" : ""
                  }`}
                >
                  <View className="bg-primary-500 rounded-full w-16 h-16" />
                </Button>

                <Button
                  variant="outline"
                  onPress={continueToIncidentDetails}
                  disabled={
                    capturedPhotos.length === 0 ||
                    uploading ||
                    isAddingImages ||
                    isCreatingIncident
                  }
                  className={`bg-black/40 rounded-full w-12 h-12 justify-center items-center ${
                    capturedPhotos.length === 0 ? "opacity-50" : ""
                  }`}
                >
                  <IconSymbol
                    name={
                      uploading || isAddingImages || isCreatingIncident
                        ? "arrow.clockwise"
                        : "checkmark"
                    }
                    size={24}
                    color="white"
                  />
                </Button>
              </HStack>
            </View>
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}
