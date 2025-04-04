// new.tsx - using React Native Picker with fixed TypeScript types
import React, { useState, useEffect } from "react";
import { Alert, ScrollView, Text, View, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import BackButton from "@/components/BackButton";
import { useCreateIncident } from "@/hooks/incidents/useCreateIncident";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@/components/ui/spinner";
import { ThemedView } from "@/components/ThemedView";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";

// Define the possible incident types and other value types
type IncidentType =
  | ""
  | "Water Damage"
  | "Electrical Issue"
  | "Structural Damage"
  | "HVAC Problem"
  | "Pest Infestation"
  | "Plumbing Issue"
  | "Security Concern"
  | "Fire Safety"
  | "Mold/Mildew"
  | "Other";

type SeverityType = "Low" | "Medium" | "High" | "Critical";

type SpaceType =
  | ""
  | "Kitchen"
  | "LivingRoom"
  | "Bedroom"
  | "Bathroom"
  | "Hallway"
  | "Exterior"
  | "Garage"
  | "Other";

const NewIncidentScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const skipPhotos = params.skipPhotos === "true";

  const {
    createIncident,
    isPending: isCreating,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
    error: createError,
    data: createdIncident,
  } = useCreateIncident();

  const [incidentType, setIncidentType] = useState<IncidentType>("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<SeverityType>("Medium");
  const [spaceType, setSpaceType] = useState<SpaceType>("");

  // Form validation
  const [formErrors, setFormErrors] = useState({
    incidentType: false,
    description: false,
  });

  // Handle create success
  useEffect(() => {
    if (isCreateSuccess && createdIncident) {
      Alert.alert(
        "Incident Created",
        "The incident has been successfully created.",
        [
          {
            text: "View Details",
            onPress: () =>
              router.push({
                pathname: "/(tabs)/(incidents)/details",
                params: { incidentId: createdIncident.id.toString() },
              }),
          },
        ],
      );
    }
  }, [isCreateSuccess, createdIncident]);

  const validateForm = () => {
    const errors = {
      incidentType: !incidentType.trim(),
      description: !description.trim(),
    };

    setFormErrors(errors);
    return !errors.incidentType && !errors.description;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (!propertyId) {
      Alert.alert("Error", "Property ID is missing");
      return;
    }

    // Create a new incident
    createIncident({
      propertyId: parseInt(propertyId),
      incidentType,
      description,
      severity: severity,
      spaceType: spaceType || undefined,
      reportedAt: new Date().toISOString(),
      status: "Open",
      aiClassified: false,
    });
  };

  // Style for the picker based on platform
  const pickerStyle =
    Platform.OS === "ios"
      ? {
          marginTop: 8,
          backgroundColor: "#f9fafb",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }
      : { marginTop: 8, backgroundColor: "#f9fafb", borderRadius: 8 };

  return (
    <ThemedView className="flex-1">
      <ScrollView className="flex-1 bg-primary-50">
        <Box className="p-4">
          <BackButton />

          <Heading className="text-xl my-4">Report New Incident</Heading>

          {/* Incident Form */}
          <Box className="bg-white p-4 rounded-lg shadow-sm mb-6">
            {/* Incident Type */}
            <FormControl isInvalid={formErrors.incidentType}>
              <FormControlLabel>
                <FormControlLabelText>Incident Type*</FormControlLabelText>
              </FormControlLabel>
              <View style={pickerStyle}>
                <Picker<IncidentType>
                  selectedValue={incidentType}
                  onValueChange={(value: IncidentType) => {
                    setIncidentType(value);
                    setFormErrors((prev) => ({ ...prev, incidentType: false }));
                  }}
                  mode="dropdown"
                >
                  <Picker.Item label="Select incident type" value="" />
                  <Picker.Item label="Water Damage" value="Water Damage" />
                  <Picker.Item
                    label="Electrical Issue"
                    value="Electrical Issue"
                  />
                  <Picker.Item
                    label="Structural Damage"
                    value="Structural Damage"
                  />
                  <Picker.Item label="HVAC Problem" value="HVAC Problem" />
                  <Picker.Item
                    label="Pest Infestation"
                    value="Pest Infestation"
                  />
                  <Picker.Item label="Plumbing Issue" value="Plumbing Issue" />
                  <Picker.Item
                    label="Security Concern"
                    value="Security Concern"
                  />
                  <Picker.Item label="Fire Safety" value="Fire Safety" />
                  <Picker.Item label="Mold/Mildew" value="Mold/Mildew" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
              {formErrors.incidentType && (
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    Please select an incident type
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Description */}
            <FormControl isInvalid={formErrors.description} className="mt-4">
              <FormControlLabel>
                <FormControlLabelText>Description*</FormControlLabelText>
              </FormControlLabel>
              <Textarea className="mt-1">
                <TextareaInput
                  placeholder="Describe the incident in detail..."
                  value={description}
                  onChangeText={(text: string) => {
                    setDescription(text);
                    setFormErrors((prev) => ({ ...prev, description: false }));
                  }}
                  className="min-h-32"
                />
              </Textarea>
              {formErrors.description && (
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    Please provide a description
                  </FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Severity */}
            <FormControl className="mt-4">
              <FormControlLabel>
                <FormControlLabelText>Severity*</FormControlLabelText>
              </FormControlLabel>
              <View style={pickerStyle}>
                <Picker<SeverityType>
                  selectedValue={severity}
                  onValueChange={(value: SeverityType) => setSeverity(value)}
                  mode="dropdown"
                >
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="High" value="High" />
                  <Picker.Item label="Critical" value="Critical" />
                </Picker>
              </View>
            </FormControl>

            {/* Space Type */}
            <FormControl className="mt-4">
              <FormControlLabel>
                <FormControlLabelText>
                  Location in Property
                </FormControlLabelText>
              </FormControlLabel>
              <View style={pickerStyle}>
                <Picker<SpaceType>
                  selectedValue={spaceType}
                  onValueChange={(value: SpaceType) => setSpaceType(value)}
                  mode="dropdown"
                >
                  <Picker.Item label="Select space type" value="" />
                  <Picker.Item label="Kitchen" value="Kitchen" />
                  <Picker.Item label="Living Room" value="LivingRoom" />
                  <Picker.Item label="Bedroom" value="Bedroom" />
                  <Picker.Item label="Bathroom" value="Bathroom" />
                  <Picker.Item label="Hallway" value="Hallway" />
                  <Picker.Item label="Exterior" value="Exterior" />
                  <Picker.Item label="Garage" value="Garage" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
              <FormControlHelper>
                <FormControlHelperText>
                  Optional: Specify where the incident occurred
                </FormControlHelperText>
              </FormControlHelper>
            </FormControl>
          </Box>

          {isCreateError && (
            <Box className="bg-red-100 p-4 rounded-lg mb-6">
              <Text className="text-red-800">
                {createError?.message ||
                  "An error occurred while creating the incident"}
              </Text>
            </Box>
          )}

          <HStack className="space-x-2 mb-8">
            <Button
              variant="outline"
              onPress={() => router.back()}
              className="flex-1"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={handleSubmit}
              isDisabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <HStack className="items-center">
                  <Spinner color="white" size="small" />
                  <ButtonText className="ml-2">Creating...</ButtonText>
                </HStack>
              ) : (
                <ButtonText>Create Incident</ButtonText>
              )}
            </Button>
          </HStack>
        </Box>
      </ScrollView>
    </ThemedView>
  );
};

export default NewIncidentScreen;
