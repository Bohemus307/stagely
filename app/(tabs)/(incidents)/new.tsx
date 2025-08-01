import { useEffect, useState } from "react";
import { Alert, ScrollView, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { useCreateIncident } from "@/hooks/incidents/useCreateIncident";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
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
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { HStack } from "@/components/ui/hstack";

const NewIncidentScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;

  const {
    createIncident,
    isPending: isCreating,
    isSuccess: isCreateSuccess,
    isError: isCreateError,
    error: createError,
    data: createdIncident,
  } = useCreateIncident();

  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [spaceType, setSpaceType] = useState("");

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

  const handleSubmit = () => {
    if (!incidentType.trim()) {
      Alert.alert("Error", "Please specify an incident type");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please provide a description");
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
      severity: severity as "Low" | "Medium" | "High" | "Critical",
      spaceType: spaceType || undefined,
      reportedAt: new Date().toISOString(),
      status: "Open",
      aiClassified: false,
    });
  };

  return (
    // Root ScrollView, directly matching edit.tsx structure (without ThemedView wrapper)
    <ScrollView className="flex-1 bg-primary-50">
      <Box className="p-4">
        <BackButton />

        <Heading className="text-xl my-4">Report New Incident</Heading>

        {/* Incident Form */}
        <Box className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Incident Type */}
          <Box className="mb-4">
            <Text className="font-semibold mb-1">Incident Type*</Text>
            <Select
              selectedValue={incidentType}
              onValueChange={(value) => {
                console.log("Incident type selected:", value);
                setIncidentType(value);
              }}
            >
              <SelectTrigger>
                <SelectInput placeholder="Select incident type" />
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
                  <SelectItem label="HVAC Problem" value="HVAC Problem" />
                  <SelectItem
                    label="Pest Infestation"
                    value="Pest Infestation"
                  />
                  <SelectItem label="Plumbing Issue" value="Plumbing Issue" />
                  <SelectItem
                    label="Security Concern"
                    value="Security Concern"
                  />
                  <SelectItem label="Fire Safety" value="Fire Safety" />
                  <SelectItem label="Mold/Mildew" value="Mold/Mildew" />
                  <SelectItem label="Other" value="Other" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>

          {/* Description */}
          <Box className="mb-4">
            <Text className="font-semibold mb-1">Description*</Text>
            <Textarea>
              <TextareaInput
                placeholder="Describe the incident in detail..."
                value={description}
                onChangeText={(text) => setDescription(text)}
                className="min-h-32"
              />
            </Textarea>
          </Box>

          {/* Severity */}
          <Box className="mb-4">
            <Text className="font-semibold mb-1">Severity*</Text>
            <Select
              selectedValue={severity}
              onValueChange={(value) => {
                console.log("Severity selected:", value);
                setSeverity(value);
              }}
            >
              <SelectTrigger>
                <SelectInput placeholder="Select severity" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Low" value="Low" />
                  <SelectItem label="Medium" value="Medium" />
                  <SelectItem label="High" value="High" />
                  <SelectItem label="Critical" value="Critical" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>

          {/* Space Type */}
          <Box className="mb-4">
            <Text className="font-semibold mb-1">Location in Property</Text>
            <Select
              selectedValue={spaceType}
              onValueChange={(value) => {
                console.log("Space type selected:", value);
                setSpaceType(value);
              }}
            >
              <SelectTrigger>
                <SelectInput placeholder="Select space type" />
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
                  <SelectItem label="Hallway" value="Hallway" />
                  <SelectItem label="Exterior" value="Exterior" />
                  <SelectItem label="Garage" value="Garage" />
                  <SelectItem label="Other" value="Other" />
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>
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
  );
};

export default NewIncidentScreen;
