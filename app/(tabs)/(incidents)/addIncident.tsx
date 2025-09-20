import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { useGetProperties } from "@/hooks/properties/useGetProperties";
import { useGetPropertySpaces } from "@/hooks/spaces/useGetPropertySpaces";
import {
  CreateIncidentData,
  useCreateIncident,
} from "@/hooks/incidents/useCreateIncident";
import { Property, IncidentSeverity, SpaceType } from "@/lib/@types/properties";
import { useAuthUser } from "@/hooks/useAuthUser";
import { PropertySelector } from "@/components/incidents/create/PropertySelector";
import {
  PhotoOption,
  PhotoSelector,
} from "@/components/incidents/create/PhotoSelector";
import { SeveritySelector } from "@/components/incidents/create/SeveritySelector";
import { IncidentSummaryCard } from "@/components/incidents/create/IncidentSummaryCard";
import { Image } from "@/components/ui/image";
import { Spinner } from "@/components/ui/spinner";
import { useS3Upload } from "@/hooks/useS3Upload";
import * as ImageManipulator from "expo-image-manipulator";

// Helper function to convert S3 URL to CloudFront URL
const getCloudFrontUrl = (s3Url: string): string | null => {
  if (!s3Url) return null;

  // Extract the S3 key from the URL
  const s3Key = s3Url.split("amazonaws.com/")[1];

  if (!s3Key) return s3Url; // Return original if we can't extract the key

  // Construct CloudFront URL
  return `https://d24y6hzot6c372.cloudfront.net/${s3Key}`;
};

const AddIncidentScreen = () => {
  const params = useLocalSearchParams();

  const returnedPhoto = params.photoUri as string;
  const returnedPhotoType = params.photoType as string;

  const [severitySelected, setSeveritySelected] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoOption | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [incidentData, setIncidentData] = useState<any>(null);

  const [incidentDetails, setIncidentDetails] = useState({
    type: "",
    severity: IncidentSeverity.Medium,
    description: "",
    spaceType: "" as SpaceType | "",
  });

  const { backendUser } = useAuthUser();
  const { properties, isLoading: propertiesLoading } = useGetProperties();
  const { propertySpaces } = useGetPropertySpaces(
    selectedProperty?.id.toString() as string,
  );
  const {
    createIncident,
    isPending: isCreating,
    isSuccess: createSuccess,
    isError: createError,
    error: createErrorData,
    data: createdIncident,
  } = useCreateIncident();
  const { uploadToS3 } = useS3Upload();

  useEffect(() => {
    if (selectedProperty && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [selectedProperty, currentStep]);

  // Handle returned photo from camera/gallery
  useEffect(() => {
    if (returnedPhoto && returnedPhotoType) {
      const newPhoto = {
        id: Math.floor(Math.random() * 1000000),
        uri: returnedPhoto,
        type: returnedPhotoType as SpaceType,
        takenAt: new Date().toISOString(),
      };
      setSelectedPhoto(newPhoto);
      // Move to step 3 if we have both property and photo
      if (selectedProperty) {
        setCurrentStep(3);
      }
    }
  }, [returnedPhoto, returnedPhotoType, selectedProperty]);

  // Handle successful incident creation - move to step 4
  useEffect(() => {
    if (createSuccess && createdIncident) {
      // Store the full incident data
      setIncidentData(createdIncident);
      // Move to summary step
      setCurrentStep(4);
    }
  }, [createSuccess, createdIncident]);

  // Handle error in incident creation
  useEffect(() => {
    if (createError && createErrorData) {
      console.error("Error creating incident:", createErrorData);
      Alert.alert(
        "Error",
        `Failed to submit incident: ${createErrorData.message || "Unknown error"}`,
        [
          {
            text: "OK",
            style: "cancel",
          },
        ],
      );
    }
  }, [createError, createErrorData]);

  // Handle photo selection
  const handleTakePhoto = () => {
    router.push({
      pathname: "/(tabs)/(dashboard)/camera",
      params: {
        propertyId: selectedProperty?.id.toString(),
        returnTo: "addIncident",
      },
    });
  };

  const handleSelectFromGallery = () => {
    router.push({
      pathname: "/(tabs)/(dashboard)/(photos)/select",
      params: {
        propertyId: selectedProperty?.id.toString(),
        returnTo: "addIncident",
      },
    });
  };

  // Handle manual photo selection (from space/existing photos)
  useEffect(() => {
    if (selectedPhoto && !returnedPhoto && currentStep === 2) {
      // Move to step 3 when photo is manually selected and we're on step 2
      setCurrentStep(3);
    }
  }, [selectedPhoto, returnedPhoto, currentStep]);

  // Helper function to convert URI to Blob (handles ph:// URIs)
  const uriToBlob = async (uri: string): Promise<Blob> => {
    console.log(
      "[uriToBlob] Starting blob creation for URI:",
      uri.substring(0, 30) + "...",
    );

    let tempFileUri: string | null = null;
    let processedUri = uri;

    try {
      // Handle photo library URIs (ph://)
      if (uri.startsWith("ph://")) {
        console.log("[uriToBlob] Detected photo library URI, processing...");

        try {
          // Extract asset ID from the ph:// URI
          const assetId = uri.replace("ph://", "").split("/")[0];
          console.log("[uriToBlob] Extracted asset ID:", assetId);

          // Get asset info to retrieve localUri
          const asset = await MediaLibrary.getAssetInfoAsync(assetId);
          console.log("[uriToBlob] Got asset info:", {
            id: asset.id,
            hasLocalUri: !!asset.localUri,
            hasUri: !!asset.uri,
            filename: asset.filename,
          });

          // Use localUri if available
          if (asset.localUri) {
            console.log("[uriToBlob] Using localUri instead of photo URI");
            processedUri = asset.localUri;
          }
        } catch (assetError) {
          console.log(
            "[uriToBlob] Could not get asset info, falling back to FileSystem:",
            assetError,
          );

          // Fallback: copy the image to a temporary file
          try {
            const timestamp = new Date().getTime() % 1000000;
            const random = Math.floor(Math.random() * 10000);
            const uniqueFileName = `temp_incident_image_${timestamp}_${random}.jpg`;
            tempFileUri = FileSystem.cacheDirectory + uniqueFileName;

            console.log("[uriToBlob] Creating temporary file at:", tempFileUri);

            // Check if file exists and delete if it does
            const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
            if (fileInfo.exists) {
              console.log("[uriToBlob] File already exists, deleting it");
              await FileSystem.deleteAsync(tempFileUri);
            }

            // Copy the photo to temporary file
            await FileSystem.copyAsync({
              from: uri,
              to: tempFileUri,
            });

            console.log("[uriToBlob] Successfully copied to temporary file");
            processedUri = tempFileUri;
          } catch (copyError) {
            console.error("[uriToBlob] Error copying file:", copyError);
            throw new Error(
              `Failed to process photo library image: ${copyError}`,
            );
          }
        }
      }

      // **NEW: Convert HEIC/HEIF to JPEG using Expo ImageManipulator**
      console.log("[uriToBlob] Converting image to JPEG and optimizing...");

      try {
        // Use ImageManipulator to convert any format (including HEIC) to JPEG
        const result = await ImageManipulator.manipulateAsync(
          processedUri,
          [
            // Resize if too large (optional - adjust as needed)
            { resize: { width: 1568 } }, // Maintains aspect ratio, max width 1568px
          ],
          {
            compress: 0.85, // 85% quality for good balance of quality/size
            format: ImageManipulator.SaveFormat.JPEG, // Force JPEG output
          },
        );

        console.log("[uriToBlob] Image converted successfully:", {
          originalUri: processedUri.substring(0, 30) + "...",
          convertedUri: result.uri.substring(0, 30) + "...",
          width: result.width,
          height: result.height,
        });

        // Use the converted image URI
        processedUri = result.uri;
      } catch (conversionError) {
        console.warn(
          "[uriToBlob] Image conversion failed, using original:",
          conversionError,
        );
        // Continue with original URI if conversion fails
      }

      // Fetch and convert to blob
      console.log(
        "[uriToBlob] Fetching from processed URI:",
        processedUri.substring(0, 30) + "...",
      );
      const response = await fetch(processedUri);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
        );
      }

      const blob = await response.blob();
      console.log("[uriToBlob] Blob created successfully:", {
        size: blob.size,
        type: blob.type || "image/jpeg",
      });

      // Ensure blob has correct MIME type
      if (!blob.type || blob.type === "application/octet-stream") {
        console.log("[uriToBlob] Fixing blob MIME type to image/jpeg");
        return new Blob([blob], { type: "image/jpeg" });
      }

      return blob;
    } catch (error) {
      console.error("[uriToBlob] Error creating blob:", error);
      throw error;
    } finally {
      // Clean up temporary file if created
      if (tempFileUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
          if (fileInfo.exists) {
            console.log("[uriToBlob] Cleaning up temporary file:", tempFileUri);
            await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
          }
        } catch (cleanupError) {
          console.log("[uriToBlob] Error during cleanup:", cleanupError);
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation checks
    if (!backendUser?.id) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      return;
    }

    if (!selectedProperty) {
      Alert.alert("Error", "Please select a property");
      return;
    }

    try {
      setIsUploading(true);

      // Include photo in request if available
      const incidentData: CreateIncidentData = {
        userId: backendUser.id,
        propertyId: selectedProperty.id,
        incidentType: incidentDetails.type,
        description: incidentDetails.description,
        severity: incidentDetails.severity,
        spaceType: selectedPhoto?.analysisData?.type,
        spaceId: selectedPhoto?.id,
        reportedAt: new Date().toISOString(),
        status: "Open",
        aiClassified: false,
      };

      // Check if photo has spaceId (existing photo from property)
      if (selectedPhoto?.uri && selectedPhoto.spaceId) {
        // Photo already exists in the system, use its existing URL
        incidentData.images = [
          {
            imageUrl: selectedPhoto.uri,
            takenAt: selectedPhoto.takenAt || new Date().toISOString(),
            caption: selectedPhoto.type,
          },
        ];
      } else if (selectedPhoto?.uri) {
        // New photo from camera/gallery - needs S3 upload
        console.log("Uploading new photo to S3...");

        try {
          // Convert URI to Blob
          const blob = await uriToBlob(selectedPhoto.uri);

          // Generate unique filename
          const timestamp = Date.now();
          const fileName = `incidents/${selectedProperty.id}/${timestamp}_incident.jpg`;

          // Upload to S3
          const s3Url = await uploadToS3(blob, fileName);
          console.log("S3 upload successful:", s3Url);

          // Convert to CloudFront URL
          const cloudFrontUrl = getCloudFrontUrl(s3Url);

          if (!cloudFrontUrl) {
            throw new Error("Failed to generate CloudFront URL");
          }

          console.log("CloudFront URL:", cloudFrontUrl);

          // Add image to incident data
          incidentData.images = [
            {
              imageUrl: cloudFrontUrl,
              takenAt: selectedPhoto.takenAt || new Date().toISOString(),
              caption:
                selectedPhoto.type ||
                incidentDetails.spaceType ||
                "Incident Photo",
            },
          ];
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          setIsUploading(false);
          Alert.alert(
            "Upload Error",
            "Failed to upload photo. Would you like to submit without the photo?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Submit Without Photo",
                onPress: async () => {
                  // Submit without image
                  console.log("Submitting incident without photo");
                  createIncident(incidentData);
                },
              },
            ],
          );
          return;
        }
      }

      setIsUploading(false);
      console.log(
        "Submitting incident data:",
        JSON.stringify(incidentData, null, 2),
      );
      createIncident(incidentData);
    } catch (error) {
      setIsUploading(false);
      console.error("Error submitting incident:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.", [
        { text: "OK", style: "cancel" },
      ]);
    }
  };

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedProperty !== null;
      case 2:
        return selectedPhoto !== null;
      case 3:
        return (
          incidentDetails.type !== "" &&
          incidentDetails.description.trim() !== ""
        );
      default:
        return false;
    }
  };

  // Render step indicator with labels
  const renderStepIndicator = () => (
    <Box className="py-4 px-4 bg-gray-50">
      <HStack className="justify-between items-start">
        {[
          { step: 1, label: "Property" },
          { step: 2, label: "Photo" },
          { step: 3, label: "Details" },
          { step: 4, label: "Summary" },
        ].map((item, index) => (
          <React.Fragment key={item.step}>
            <VStack className="items-center flex-1">
              <Box
                className={`w-10 h-10 rounded-full justify-center items-center ${
                  item.step === currentStep
                    ? "bg-primary-500"
                    : item.step < currentStep
                      ? "bg-green-500"
                      : "bg-gray-300"
                }`}
              >
                {item.step < currentStep ? (
                  <IconSymbol name="checkmark" size={18} color="white" />
                ) : (
                  <Text
                    className={`${item.step === currentStep ? "text-white" : "text-gray-600"} font-semibold`}
                  >
                    {item.step}
                  </Text>
                )}
              </Box>
              <Text
                className={`text-xs font-mont mt-1 ${
                  item.step === currentStep ? "font-semibold" : "font-normal"
                }`}
              >
                {item.label}
              </Text>
            </VStack>
            {index < 3 && (
              <Box
                className={`flex-1 h-0.5 mt-5 ${item.step < currentStep ? "bg-green-500" : "bg-gray-300"}`}
              />
            )}
          </React.Fragment>
        ))}
      </HStack>
    </Box>
  );

  // Render Step 1: Property Selection
  const renderPropertySelection = () => (
    <PropertySelector
      properties={properties?.data}
      selectedProperty={selectedProperty}
      onSelectProperty={setSelectedProperty}
      loading={propertiesLoading}
    />
  );
  // Render Step 2: Photo Selection
  const renderPhotoSelection = () => (
    <PhotoSelector
      propertyId={selectedProperty?.id || 0}
      selectedPhoto={selectedPhoto}
      onSelectPhoto={setSelectedPhoto}
      onTakePhoto={handleTakePhoto}
      onSelectFromGallery={handleSelectFromGallery}
      propertySpaces={propertySpaces || []}
      recentPhotos={[]} // TODO: Add recent photos hook
    />
  );

  // Render Step 3: Incident Details
  const renderIncidentDetails = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <Box className="p-4">
            {/* Photo Preview - Always visible */}
            {selectedPhoto && (
              <Box className="mb-4">
                <ThemedText className="text-sm font-semibold text-gray-600 mb-2">
                  {selectedPhoto?.analysisData?.name || "PHOTO PREVIEW"}
                </ThemedText>
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
              </Box>
            )}

            {/* Severity Selector - Shows first, then hides after selection */}
            {!severitySelected && (
              <Box className="mb-4">
                <ThemedText className="text-lg font-semibold mb-3">
                  How severe is this incident?
                </ThemedText>
                <SeveritySelector
                  selectedSeverity={incidentDetails.severity}
                  onSelectSeverity={(severity) => {
                    setIncidentDetails({ ...incidentDetails, severity });
                    // Auto-progress after severity selection
                    setTimeout(() => setSeveritySelected(true), 300);
                  }}
                  showDescriptions={true}
                />
              </Box>
            )}

            {/* Form fields show after severity is selected */}
            {severitySelected && (
              <>
                {/* Show selected severity as a chip */}
                <Box className="mb-4 flex-row items-center">
                  <ThemedText className="text-sm text-gray-600 mr-2">
                    Severity:
                  </ThemedText>
                  <Pressable
                    onPress={() => setSeveritySelected(false)}
                    className={`px-3 py-1 rounded-full flex-row items-center ${
                      incidentDetails.severity === IncidentSeverity.High
                        ? "bg-red-100"
                        : incidentDetails.severity === IncidentSeverity.Medium
                          ? "bg-yellow-100"
                          : "bg-green-100"
                    }`}
                  >
                    <ThemedText
                      className={`text-sm font-semibold ${
                        incidentDetails.severity === IncidentSeverity.High
                          ? "text-red-700"
                          : incidentDetails.severity === IncidentSeverity.Medium
                            ? "text-yellow-700"
                            : "text-green-700"
                      }`}
                    >
                      {incidentDetails.severity}
                    </ThemedText>
                    <IconSymbol
                      name="pencil"
                      size={12}
                      color={
                        incidentDetails.severity === IncidentSeverity.High
                          ? "#B91C1C"
                          : incidentDetails.severity === IncidentSeverity.Medium
                            ? "#A16207"
                            : "#15803D"
                      }
                      style={{ marginLeft: 4 }}
                    />
                  </Pressable>
                </Box>

                {/* Space Type */}
                <Box className="mb-4">
                  <ThemedText className="font-semibold mb-2">
                    Location in Property
                  </ThemedText>
                  {!selectedPhoto?.analysisData?.type ? (
                    <Select
                      selectedValue={incidentDetails.spaceType}
                      onValueChange={(value) =>
                        setIncidentDetails({
                          ...incidentDetails,
                          spaceType: value as SpaceType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectInput
                          placeholder="Select space type (optional)"
                          value={incidentDetails.spaceType}
                        />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          <SelectItem label="Kitchen" value="Kitchen" />
                          <SelectItem label="Living Room" value="LivingRoom" />
                          <SelectItem label="Bedroom" value="Bedroom" />
                          <SelectItem label="Bathroom" value="Bathroom" />
                          <SelectItem label="Dining Room" value="DiningRoom" />
                          <SelectItem label="Hallway" value="Hallway" />
                          <SelectItem label="Basement" value="Basement" />
                          <SelectItem label="Attic" value="Attic" />
                          <SelectItem label="Garage" value="Garage" />
                          <SelectItem label="Exterior" value="Exterior" />
                          <SelectItem label="Yard" value="Yard" />
                          <SelectItem label="Other" value="Other" />
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  ) : (
                    <ThemedText>{selectedPhoto?.analysisData?.type}</ThemedText>
                  )}
                </Box>

                {/* Incident Type */}
                <Box className="mb-4">
                  <ThemedText className="font-semibold mb-2">
                    Incident Type
                  </ThemedText>
                  <Select
                    selectedValue={incidentDetails.type}
                    onValueChange={(value: any) =>
                      setIncidentDetails({ ...incidentDetails, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectInput
                        placeholder="Select incident type"
                        value={incidentDetails.type}
                      />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        <SelectDragIndicatorWrapper>
                          <SelectDragIndicator />
                        </SelectDragIndicatorWrapper>
                        <SelectItem label="Water Damage" value="Water Damage" />
                        <SelectItem
                          label="Electrical Issue"
                          value="Electrical Issue"
                        />
                        <SelectItem
                          label="Structural Damage"
                          value="Structural Damage"
                        />
                        <SelectItem
                          label="Missing Items"
                          value="Missing Items"
                        />
                        <SelectItem label="HVAC Problem" value="HVAC Problem" />
                        <SelectItem
                          label="Pest Infestation"
                          value="Pest Infestation"
                        />
                        <SelectItem
                          label="Plumbing Issue"
                          value="Plumbing Issue"
                        />
                        <SelectItem
                          label="Security Concern"
                          value="Security Concern"
                        />
                        <SelectItem label="Fire Safety" value="Fire Safety" />
                        <SelectItem label="Mold/Mildew" value="Mold/Mildew" />
                        <SelectItem
                          label="Appliance Issue"
                          value="Appliance Issue"
                        />
                        <SelectItem label="Roof/Gutter" value="Roof/Gutter" />
                        <SelectItem label="Window/Door" value="Window/Door" />
                        <SelectItem label="Flooring" value="Flooring" />
                        <SelectItem label="Other" value="Other" />
                        <SelectItem
                          label="Damaged Items"
                          value="Damaged Items"
                        />
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </Box>

                {/* Description */}
                <Box className="mb-6">
                  <ThemedText className="font-semibold mb-2">
                    Description
                  </ThemedText>
                  <Textarea className="bg-white">
                    <TextareaInput
                      placeholder="Describe the incident in detail. Include when you first noticed it, any potential causes, and immediate concerns..."
                      value={incidentDetails.description}
                      onChangeText={(text: any) =>
                        setIncidentDetails({
                          ...incidentDetails,
                          description: text,
                        })
                      }
                      className="min-h-32"
                      multiline
                      textAlignVertical="top"
                    />
                  </Textarea>
                  <ThemedText className="text-xs text-gray-500 mt-1">
                    {incidentDetails.description.length}/500 characters
                  </ThemedText>
                </Box>
              </>
            )}
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  // Render Step 4: Incident Summary
  const renderIncidentSummary = () => {
    if (!incidentData) return null;

    return (
      <Box className="flex-1">
        <IncidentSummaryCard
          property={incidentData.property || selectedProperty}
          photo={selectedPhoto}
          incidentType={incidentData.incidentType}
          severity={incidentData.severity}
          description={incidentData.description}
          spaceType={incidentData.spaceType}
          incidentId={incidentData.id}
          status={incidentData.status}
          createdAt={incidentData.createdAt}
          featureVector={incidentData.featureVector}
          showSuccessHeader={true}
        />
      </Box>
    );
  };

  // Main render
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Box className="px-2 py-2 border-b border-gray-200 bg-white">
        <HStack className="justify-between items-center">
          <ThemedText
            type="defaultSemiBold"
            className="font-medium text-center flex-1"
          >
            {currentStep === 4 ? "Incident Submitted" : "Report Incident"}
          </ThemedText>
        </HStack>
      </Box>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content */}
      <Box className="flex-1 bg-gray-50">
        {currentStep === 1 && renderPropertySelection()}
        {currentStep === 2 && selectedProperty && renderPhotoSelection()}
        {currentStep === 3 && renderIncidentDetails()}
        {currentStep === 4 && renderIncidentSummary()}
      </Box>

      {/* Bottom Navigation */}
      <Box className="px-4 py-3 border-t border-gray-200 bg-white">
        {currentStep === 4 ? (
          <VStack className="gap-2">
            <Button
              onPress={() => {
                router.replace({
                  pathname: "/(tabs)/(incidents)/details",
                  params: { incidentId: incidentData.id.toString() },
                });
              }}
              className="w-full"
            >
              <HStack className="items-center justify-center">
                <IconSymbol
                  name="arrow.right.circle.fill"
                  size={18}
                  color="white"
                />
                <ButtonText className="ml-2">View Incident Details</ButtonText>
              </HStack>
            </Button>
            <Button
              variant="outline"
              onPress={() => {
                router.back();
              }}
              className="w-full"
            >
              <ButtonText>Done</ButtonText>
            </Button>
          </VStack>
        ) : (
          <HStack className=" h-1/6 pt-4 gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onPress={goToPreviousStep}
                className="flex-1"
              >
                <ButtonText>Back</ButtonText>
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                onPress={goToNextStep}
                disabled={!canProceedToNext()}
                className="flex-1"
              >
                <HStack className="items-center justify-center">
                  <ButtonText>Next</ButtonText>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color="white"
                    style={{ marginLeft: 4 }}
                  />
                </HStack>
              </Button>
            ) : (
              <Button
                onPress={handleSubmit}
                disabled={isCreating || isUploading || !canProceedToNext()}
                className="flex-1"
              >
                {isUploading ? (
                  <HStack className="items-center justify-center">
                    <Spinner color="white" size="small" />
                    <ButtonText className="ml-2">Uploading Photo...</ButtonText>
                  </HStack>
                ) : isCreating ? (
                  <HStack className="items-center justify-center">
                    <Spinner color="white" size="small" />
                    <ButtonText className="ml-2">Creating...</ButtonText>
                  </HStack>
                ) : (
                  <HStack className="items-center justify-center">
                    <IconSymbol
                      name="checkmark.circle"
                      size={18}
                      color="white"
                    />
                    <ButtonText className="ml-2">Submit Incident</ButtonText>
                  </HStack>
                )}
              </Button>
            )}
          </HStack>
        )}
      </Box>
    </SafeAreaView>
  );
};

export default AddIncidentScreen;
