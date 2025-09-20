import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonText } from "@/components/ui/button";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
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

import {
  getCloudFrontUrl,
  incidentTypes,
  uriToBlob,
} from "@/components/incidents/lib/utils/incidentHelpers";

const AddIncidentScreen = () => {
  const params = useLocalSearchParams();

  const returnedPhoto = params.photoUri as string;
  const returnedPhotoType = params.photoType as string;
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSubStep, setCurrentSubStep] = useState(1); // For severity (1), type (2), and description (3)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoOption | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [incidentData, setIncidentData] = useState<any>(null);

  // Simplified incident details
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

    if (!incidentDetails.type) {
      Alert.alert("Error", "Please select an incident type");
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

  const goToPreviousStep = () => {
    if (currentStep === 2) {
      setSelectedProperty(null);
      setCurrentStep(1);
    } else if (currentStep === 3) {
      if (currentSubStep === 3) {
        // Go back to incident type selection
        setCurrentSubStep(2);
      } else if (currentSubStep === 2) {
        // Go back to severity selection
        setCurrentSubStep(1);
      } else {
        // Go back to photo selection
        setSelectedPhoto(null);
        setCurrentStep(2);
      }
    }
  };

  // Handle severity selection
  const handleSeveritySelected = (severity: IncidentSeverity) => {
    setIncidentDetails({ ...incidentDetails, severity });
    // Move to incident type selection
    setCurrentSubStep(2);
  };

  // Handle incident type selection
  const handleIncidentTypeSelected = (type: string) => {
    setIncidentDetails({ ...incidentDetails, type });
    // Move to description input
    setCurrentSubStep(3);
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

  // Render Step 3.1: Severity Selection
  const renderSeveritySelection = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <Box className="p-4">
            {/* Photo Preview */}
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
            {/* Severity Selector */}
            <Box className="mb-4">
              <ThemedText className="text-lg font-semibold mb-3">
                How severe is this incident?
              </ThemedText>
              <SeveritySelector
                selectedSeverity={incidentDetails.severity}
                onSelectSeverity={handleSeveritySelected}
                showDescriptions={true}
              />
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  // Render Step 3.2: Incident Type Selection
  const renderIncidentTypeSelection = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <Box className="p-4">
            {/* Severity Chip */}
            <Box className="mb-4">
              <ThemedText className="text-sm text-gray-600 mb-2">
                Selected Severity:
              </ThemedText>
              <Box
                className={`px-3 py-2 rounded-md w-auto self-start flex-row items-center ${
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
              </Box>
            </Box>

            {/* Incident Type Selection */}
            <Box className="mb-4">
              <ThemedText className="text-lg font-semibold mb-3">
                What type of incident is this?
              </ThemedText>
              <ThemedText className="text-sm text-gray-600 mb-4">
                Choose the category that best matches the issue.
              </ThemedText>

              <VStack>
                {incidentTypes.map((item) => (
                  <Pressable
                    key={item.type}
                    onPress={() => handleIncidentTypeSelected(item.type)}
                    className={`p-3 rounded-lg border ${
                      incidentDetails.type === item.type
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200"
                    }`}
                  >
                    <HStack className="items-center">
                      <Box
                        style={{ backgroundColor: item.color }}
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      >
                        <IconSymbol
                          name={item.icon as IconSymbolName}
                          size={20}
                          color="white"
                        />
                      </Box>
                      <VStack className="flex-1">
                        <ThemedText className="font-semibold">
                          {item.type}
                        </ThemedText>
                        <ThemedText className="text-xs text-gray-600">
                          {item.description}
                        </ThemedText>
                      </VStack>
                      {incidentDetails.type === item.type && (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={22}
                          color="#0284c7"
                        />
                      )}
                    </HStack>
                  </Pressable>
                ))}
              </VStack>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  // Render Step 3.3: Incident Description Input
  const renderIncidentDescriptionInput = () => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <Box className="p-4">
            {/* Type Chip */}
            <Box className="mb-4">
              <ThemedText className="text-sm text-gray-600 mb-2">
                Selected Type:
              </ThemedText>
              <Box className="px-3 py-2 rounded-md w-auto self-start flex-row items-center bg-primary-50">
                <ThemedText className="text-sm font-semibold text-primary-700">
                  {incidentDetails.type}
                </ThemedText>
              </Box>
            </Box>

            {/* Description Input */}
            <Box className="mb-4">
              <ThemedText className="text-lg font-semibold mb-3">
                Would you like to add a description?
              </ThemedText>
              <ThemedText className="text-sm text-gray-600 mb-4">
                Provide additional details about the incident (optional).
              </ThemedText>

              <Box className="p-3 rounded-lg border border-gray-200 bg-white">
                <Textarea size="md" className="h-40">
                  <TextareaInput
                    value={incidentDetails.description}
                    onChangeText={(text) =>
                      setIncidentDetails({
                        ...incidentDetails,
                        description: text,
                      })
                    }
                    placeholder="Describe the incident in more detail..."
                  />
                </Textarea>
              </Box>
            </Box>
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
        {currentStep === 3 && currentSubStep === 1 && renderSeveritySelection()}
        {currentStep === 3 &&
          currentSubStep === 2 &&
          renderIncidentTypeSelection()}
        {currentStep === 3 &&
          currentSubStep === 3 &&
          renderIncidentDescriptionInput()}
        {currentStep === 4 && renderIncidentSummary()}
      </Box>

      {/* Bottom Navigation */}
      <Box className="px-4 py-3 border-t border-gray-200 bg-white">
        {currentStep === 4 ? (
          <HStack className="h-1/6 pt-4 gap-2">
            <Button
              onPress={() => router.push("/(tabs)/(dashboard)/")}
              className="w-full"
            >
              <ButtonText>Done</ButtonText>
            </Button>
          </HStack>
        ) : (
          <HStack className="h-1/6 pt-4 gap-2">
            {(currentStep > 1 || currentSubStep > 1) && (
              <Button
                variant="solid"
                onPress={goToPreviousStep}
                className="flex-1"
              >
                <ButtonText>Back</ButtonText>
              </Button>
            )}
            {currentStep === 3 && currentSubStep === 3 && (
              <Button
                onPress={handleSubmit}
                disabled={isCreating || isUploading || !incidentDetails.type}
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
