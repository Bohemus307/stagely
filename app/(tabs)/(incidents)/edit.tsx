import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { useGetIncidentById } from "@/hooks/incidents/useGetIncidentsById";
import { useUpdateIncident } from "@/hooks/incidents/useUpdateIncident";
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

const IncidentEditScreen = () => {
  const { incidentId } = useLocalSearchParams();
  const id = incidentId as string;

  const {
    incident,
    isLoading: incidentLoading,
    error: incidentError,
  } = useGetIncidentById(id);

  const {
    updateIncident,
    isPending: isUpdating,
    isSuccess,
    isError,
    error: updateError,
    data: updatedIncident,
  } = useUpdateIncident(id);

  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<string>("");
  const [spaceType, setSpaceType] = useState<string>("");

  useEffect(() => {
    if (incident) {
      setIncidentType(incident.incidentType || "");
      setDescription(incident.description || "");
      setSeverity(incident.severity || "Medium");
      setSpaceType(incident.spaceType || "");
    }
  }, [incident]);

  useEffect(() => {
    if (isSuccess && updatedIncident) {
      Alert.alert(
        "Incident Updated",
        "The incident has been successfully updated.",
        [
          {
            text: "View Details",
            onPress: () =>
              router.push({
                pathname: "/(tabs)/(incidents)/details",
                params: { incidentId: id },
              }),
          },
        ],
      );
    }
  }, [isSuccess, updatedIncident, id]);

  const handleSubmit = () => {
    if (!incidentType.trim()) {
      Alert.alert("Error", "Please specify an incident type");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    updateIncident({
      incidentType,
      description,
      severity: severity as "Low" | "Medium" | "High" | "Critical",
      spaceType: spaceType || undefined,
    });
  };

  if (incidentLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </View>
    );
  }

  if (incidentError || !incident) {
    return (
      <View className="flex-1 justify-center items-center">
        <BackButton />
        <Text>
          {incidentError
            ? `Error loading incident: ${incidentError.message}`
            : "Incident not found"}
        </Text>
        <Button className="mt-4" onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-primary-50">
      <Box className="p-4">
        <BackButton />

        <Heading className="text-xl my-4">Edit Incident</Heading>

        {/* Incident Form */}
        <Box className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Incident Type */}
          <Box className="mb-4">
            <Text className="font-semibold mb-1">Incident Type*</Text>
            <Select
              selectedValue={incidentType}
              onValueChange={(value) => setIncidentType(value)}
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
              onValueChange={(value) => setSeverity(value)}
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
              onValueChange={(value) => setSpaceType(value)}
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

        {isError && (
          <Box className="bg-red-100 p-4 rounded-lg mb-6">
            <Text className="text-red-800">
              {updateError?.message ||
                "An error occurred while updating the incident"}
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
            isDisabled={isUpdating}
            className="flex-1"
          >
            {isUpdating ? (
              <HStack className="items-center">
                <Spinner color="white" size="small" />
                <ButtonText className="ml-2">Saving...</ButtonText>
              </HStack>
            ) : (
              <ButtonText>Save Changes</ButtonText>
            )}
          </Button>
        </HStack>
      </Box>
    </ScrollView>
  );
};

export default IncidentEditScreen;
