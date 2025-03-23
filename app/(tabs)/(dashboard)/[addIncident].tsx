import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, SafeAreaView, ScrollView } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraType,
  FlashMode,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import Swiper from "react-native-swiper";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Image } from "@/components/ui/image";

import { ThemedView } from "@/components/ThemedView";

import { properties } from "@/components/properties/data/properties";
import { Property } from "@/lib/@types/properties";

interface ReferencePhoto {
  id: string;
  uri: string;
  area: string;
}

interface CapturedPhoto {
  id: string;
  uri: string;
  matchScore: number;
  timestamp: string;
}

// Extend the Property interface to include referencePhotos
interface ExtendedProperty extends Property {
  referencePhotos?: ReferencePhoto[];
}

export default function SmartPhotoCapture(): React.ReactElement {
  const router = useRouter();
  const params = useLocalSearchParams<{ propertyId: string }>();
  const propertyId = params.propertyId;

  const cameraRef = useRef<any>(null);
  const swiperRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [referencePhotos, setReferencePhotos] = useState<ReferencePhoto[]>([]);
  const [angleMatchScore, setAngleMatchScore] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [property, setProperty] = useState<ExtendedProperty | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);

  // Get the property details based on the ID
  useEffect(() => {
    if (propertyId) {
      const selectedProperty = properties.find(
        (p) => p.property_id === parseInt(propertyId),
      ) as ExtendedProperty | undefined;

      if (selectedProperty) {
        setProperty(selectedProperty);
      }

      // Load reference photos for this property
      // In a real app, these would likely come from an API
      if (selectedProperty && selectedProperty.referencePhotos) {
        setReferencePhotos(selectedProperty.referencePhotos);
      } else {
        // Mock reference photos for demo
        setReferencePhotos([
          {
            id: "ref1",
            uri: "https://via.placeholder.com/400x300?text=Reference+Photo+1",
            area: "Kitchen",
          },
          {
            id: "ref2",
            uri: "https://via.placeholder.com/400x300?text=Reference+Photo+2",
            area: "Living Room",
          },
        ]);
      }
    }
  }, [propertyId]);

  // Request camera and media library permissions
  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        const cameraPermission = await requestPermission();
        const mediaLibraryPermission =
          await MediaLibrary.requestPermissionsAsync();

        if (
          !cameraPermission.granted ||
          mediaLibraryPermission.status !== "granted"
        ) {
          Alert.alert(
            "Permission Required",
            "Camera and media library access is required for this feature.",
            [{ text: "Go Back", onPress: () => router.back() }],
          );
        }
      }
    })();
  }, [permission, requestPermission, router]);

  // Simulate angle matching with reference photos
  useEffect(() => {
    if (referencePhotos.length > 0) {
      // This would be replaced with actual computer vision logic
      // For now, we'll simulate with a fluctuating score
      const intervalId = setInterval(() => {
        const randomFactor = Math.sin(Date.now() / 1000) * 0.25 + 0.75; // Value between 0.5 and 1
        setAngleMatchScore(Math.min(Math.floor(randomFactor * 100), 100));
      }, 500);

      return () => clearInterval(intervalId);
    }
  }, [referencePhotos]);

  // Take a photo
  const takePhoto = async (): Promise<void> => {
    if (cameraRef.current && !isCapturing && cameraReady) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });

        // Simulate processing (feature extraction, angle calculation, etc.)
        setIsProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Add to captured photos
        const newPhoto: CapturedPhoto = {
          id: `photo-${Date.now()}`,
          uri: photo.uri,
          matchScore: angleMatchScore,
          timestamp: new Date().toISOString(),
        };

        setCapturedPhotos((prevPhotos) => {
          const newPhotos = [...prevPhotos, newPhoto];

          // Update active index to show the newest photo
          setTimeout(() => {
            if (swiperRef.current) {
              swiperRef.current.scrollBy(prevPhotos.length, true);
            }
          }, 300);

          return newPhotos;
        });

        setShowGallery(true);
        setIsProcessing(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        Alert.alert("Error", "Failed to take photo: " + errorMessage);
        console.error("Failed to take photo:", error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  // Handle camera ready
  const handleCameraReady = (): void => {
    setCameraReady(true);
  };

  // Delete a photo
  const deletePhoto = (index: number): void => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          const updatedPhotos = [...capturedPhotos];
          updatedPhotos.splice(index, 1);
          setCapturedPhotos(updatedPhotos);

          if (updatedPhotos.length === 0) {
            setShowGallery(false);
          } else if (activePhotoIndex >= updatedPhotos.length) {
            setActivePhotoIndex(updatedPhotos.length - 1);
            if (swiperRef.current) {
              swiperRef.current.scrollBy(
                updatedPhotos.length - 1 - activePhotoIndex,
                true,
              );
            }
          }
        },
        style: "destructive",
      },
    ]);
  };

  // Toggle flash mode
  const toggleFlash = (): void => {
    setFlashMode(flashMode === "off" ? "on" : "off");
  };

  // Toggle camera type (front/back)
  const toggleCameraType = (): void => {
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  // Continue to incident details
  const continueToIncidentDetails = (): void => {
    if (capturedPhotos.length === 0) {
      Alert.alert(
        "No Photos",
        "Please take at least one photo before continuing.",
        [{ text: "OK" }],
      );
      return;
    }

    // In a real app, you would upload photos and get URLs
    const photoURLs = capturedPhotos.map((photo) => photo.uri);

    // Navigate to incident details with photos
    router.push({
      pathname: "/(tabs)/(incidents)",
      params: {
        propertyId: propertyId || "",
        photos: JSON.stringify(photoURLs),
      },
    });
  };

  // Handle back button
  const handleBack = (): void => {
    if (capturedPhotos.length > 0) {
      Alert.alert(
        "Discard Photos?",
        "If you go back, all captured photos will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            onPress: () => router.back(),
            style: "destructive",
          },
        ],
      );
    } else {
      router.push("/(tabs)/(incidents)");
    }
  };

  // Handle Swiper index change
  const handleIndexChange = (index: number): void => {
    setActivePhotoIndex(index);
  };

  // Switch to specific photo (from thumbnail)
  const switchToPhoto = (index: number): void => {
    setActivePhotoIndex(index);
    if (swiperRef.current) {
      swiperRef.current.scrollBy(index - activePhotoIndex, true);
    }
  };

  // Render angle match indicator
  const renderAngleMatchIndicator = (): React.ReactElement => {
    let color = "bg-red-500";
    if (angleMatchScore >= 90) color = "bg-green-500";
    else if (angleMatchScore >= 70) color = "bg-yellow-500";

    return (
      <Box className="absolute left-4 top-20 bg-black/70 rounded-full p-2">
        <VStack className="items-center">
          <Box className={`h-3 w-3 rounded-full ${color}`} />
          <Text className="text-white text-xs mt-1">
            {angleMatchScore >= 90
              ? "Excellent"
              : angleMatchScore >= 70
                ? "Good"
                : "Adjust"}
          </Text>
          <Text className="text-white text-xs font-bold">
            {angleMatchScore}%
          </Text>
        </VStack>
      </Box>
    );
  };

  // If permissions still loading
  if (!permission) {
    return (
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1 flex-col">
          <View className="flex-1 justify-center items-center">
            <Text className="text-typography-700">
              Requesting camera permissions...
            </Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // If permissions denied
  if (!permission.granted) {
    return (
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1 flex-col">
          <View className="flex-1 justify-center items-center">
            {/* <IconSymbol name="camera.slash" size={48} color="gray" /> */}
            <Text className="text-typography-700 mt-4">
              Camera access denied. Please enable camera permissions in your
              device settings.
            </Text>
            <Button className="mt-4" onPress={requestPermission}>
              <ButtonText>Grant Permission</ButtonText>
            </Button>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView>
      <View className="flex-1 bg-black">
        <StatusBar style="light" />

        {/* Camera View */}
        {!showGallery && (
          <CameraView
            ref={cameraRef}
            className="flex-1"
            facing={cameraType}
            flash={flashMode}
            onCameraReady={handleCameraReady}
            ratio="16:9"
          >
            {/* Camera UI Overlay */}
            <View className="flex-1 flex-col justify-between">
              {/* Top bar with back button and reference indicators */}
              <HStack className="w-full justify-between items-center px-4 pt-12 pb-2 bg-black/30">
                <Button
                  variant="outline"
                  onPress={handleBack}
                  className="bg-black/40 rounded-full w-10 h-10 justify-center items-center"
                >
                  <IconSymbol name="chevron.left" size={20} color="white" />
                </Button>

                <HStack className="space-x-2">
                  {referencePhotos.map((refPhoto) => (
                    <Badge
                      key={refPhoto.id}
                      className="bg-black/50 border border-white/30"
                    >
                      <Text className="text-white text-xs">
                        {refPhoto.area}
                      </Text>
                    </Badge>
                  ))}
                </HStack>

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

              {/* Reference photo overlay guide */}
              {referencePhotos.length > 0 && (
                <Box className="absolute top-1/4 right-4 bg-black/50 rounded-lg overflow-hidden">
                  <Image
                    source={{ uri: referencePhotos[0].uri }}
                    className="w-24 h-24 opacity-70"
                    alt="Reference"
                  />
                  <Badge className="absolute bottom-0 right-0 bg-black/70">
                    <Text className="text-white text-xs">Reference</Text>
                  </Badge>
                </Box>
              )}

              {/* Angle match indicator */}
              {renderAngleMatchIndicator()}

              {/* Camera controls */}
              <HStack className="w-full justify-around items-center pb-8 pt-4 bg-black/30">
                <Button
                  variant="outline"
                  onPress={toggleCameraType}
                  className="bg-black/40 rounded-full w-12 h-12 justify-center items-center"
                >
                  <IconSymbol name="camera.rotate" size={24} color="white" />
                </Button>

                <Button
                  variant="outline"
                  onPress={takePhoto}
                  disabled={isCapturing || isProcessing || !cameraReady}
                  className="bg-white rounded-full w-20 h-20 justify-center items-center border-4 border-primary-500"
                >
                  {isProcessing ? (
                    <IconSymbol
                      name="arrow.clockwise"
                      size={24}
                      color="black"
                    />
                  ) : (
                    <Box className="bg-primary-500 rounded-full w-16 h-16" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  onPress={() =>
                    capturedPhotos.length > 0 && setShowGallery(true)
                  }
                  disabled={capturedPhotos.length === 0}
                  className={`bg-black/40 rounded-full w-12 h-12 justify-center items-center ${
                    capturedPhotos.length === 0 ? "opacity-50" : ""
                  }`}
                >
                  <IconSymbol
                    name="photo.on.rectangle"
                    size={24}
                    color="white"
                  />
                  {capturedPhotos.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-primary-500 rounded-full min-w-5 h-5 justify-center items-center">
                      <Text className="text-white text-xs font-bold">
                        {capturedPhotos.length}
                      </Text>
                    </Badge>
                  )}
                </Button>
              </HStack>
            </View>
          </CameraView>
        )}

        {/* Photo gallery view */}
        {showGallery && (
          <Box className="flex-1 bg-background-950">
            {/* Gallery header */}
            <HStack className="w-full justify-between items-center px-4 pt-12 pb-2 bg-background-950">
              <Button
                variant="outline"
                onPress={() => setShowGallery(false)}
                className="rounded-full w-10 h-10 justify-center items-center"
              >
                <IconSymbol name="chevron.left" size={20} color="white" />
              </Button>

              <Heading size="sm" className="text-white">
                {capturedPhotos.length} Photo
                {capturedPhotos.length !== 1 ? "s" : ""}
              </Heading>

              <Button
                onPress={continueToIncidentDetails}
                className="rounded-md bg-primary-500"
              >
                <ButtonText>Continue</ButtonText>
              </Button>
            </HStack>

            {/* Photo swiper */}
            <Box className="flex-1 justify-center">
              {capturedPhotos.length > 0 && (
                <Swiper
                  ref={swiperRef}
                  index={activePhotoIndex}
                  loop={false}
                  onIndexChanged={handleIndexChange}
                  showsPagination={false}
                  showsButtons={false}
                >
                  {capturedPhotos.map((photo, index) => (
                    <View
                      key={photo.id}
                      className="flex-1 justify-center items-center bg-background-950"
                    >
                      <Image
                        source={{ uri: photo.uri }}
                        className="w-full h-full"
                        resizeMode="contain"
                        alt={`Photo ${index + 1}`}
                      />

                      {/* Photo info overlay */}
                      <Box className="absolute bottom-16 left-4 right-4 bg-black/70 rounded-lg p-2">
                        <HStack className="justify-between items-center">
                          <VStack>
                            <Text className="text-white text-xs">
                              Photo {index + 1} of {capturedPhotos.length}
                            </Text>
                            <HStack className="items-center space-x-1 mt-1">
                              <IconSymbol
                                name="checkmark.seal.fill"
                                size={14}
                                color={
                                  photo.matchScore >= 90
                                    ? "green"
                                    : photo.matchScore >= 70
                                      ? "yellow"
                                      : "red"
                                }
                              />
                              <Text className="text-white text-xs">
                                Match quality: {photo.matchScore}%
                              </Text>
                            </HStack>
                          </VStack>

                          <Button
                            variant="outline"
                            onPress={() => deletePhoto(index)}
                            className="rounded-full w-8 h-8 justify-center items-center bg-red-500/80"
                          >
                            <IconSymbol name="trash" size={16} color="white" />
                          </Button>
                        </HStack>
                      </Box>
                    </View>
                  ))}
                </Swiper>
              )}
            </Box>

            {/* Thumbnail strip */}
            <ScrollView
              horizontal
              className="h-20 bg-background-900 px-2 pt-2 pb-4"
            >
              {capturedPhotos.map((photo, index) => (
                <Button
                  key={photo.id}
                  variant="outline"
                  onPress={() => switchToPhoto(index)}
                  className={`mr-2 p-0 rounded-md overflow-hidden ${
                    index === activePhotoIndex
                      ? "border-2 border-primary-500"
                      : ""
                  }`}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    className="w-16 h-16"
                    alt={`Thumbnail ${index + 1}`}
                  />
                </Button>
              ))}
            </ScrollView>
          </Box>
        )}
      </View>
    </SafeAreaView>
  );
}
