import BackButton from "@/components/BackButton";
import IncidentDetails from "@/components/incidents/details/IncidentDetails";
import IncidentPhotos from "@/components/incidents/details/IncidentPhotos";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, ScrollView, View, Text } from "react-native";
import IncidentNotes from "@/components/incidents/details/IncidentNotes";
import IncidentActions from "@/components/incidents/details/IncidentQuickActions";
import { Box } from "@/components/ui/box";
import StreetViewImage from "@/components/properties/details/StreetView";
import { Badge } from "@/components/ui/badge";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { IncidentImage } from "@/lib/@types/properties";
import { useGetIncidentById } from "@/hooks/incidents/useGetIncidentsById";
import { useUpdateIncidentStatus } from "@/hooks/incidents/useUpdateIncidentStatus";
import { useGetProperty } from "@/hooks/properties/useGetPropertyById";

const IncidentsDetailsScreen = () => {
  const params = useLocalSearchParams();
  const incidentId = params.incidentId as string;
  const [streetViewError, setStreetViewError] = useState(false);
  const [notes, setNotes] = useState<{ text: string; timestamp: string }[]>([]);

  const {
    incident,
    isLoading: incidentLoading,
    error: incidentError,
  } = useGetIncidentById(incidentId, { enabled: !!incidentId });

  const {
    updateStatus,
    isPending: isStatusUpdating,
    isSuccess: isStatusUpdated,
    error: statusError,
  } = useUpdateIncidentStatus(incidentId);

  const propertyId = incident?.propertyId?.toString();
  const { property, isLoading: propertyLoading } = useGetProperty(
    propertyId || "",
  );

  const handleUpdateStatus = (incidentId: number, newStatus: string) => {
    Alert.alert(
      "Update Status",
      `Are you sure you want to change the status to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: () => {
            updateStatus({
              status: newStatus as
                | "Open"
                | "In_Progress"
                | "Resolved"
                | "Closed",
              resolvedAt:
                newStatus === "Resolved" ? new Date().toISOString() : undefined,
            });
          },
        },
      ],
    );
  };

  const handlePhotoPress = (image: IncidentImage): void => {
    router.push({
      pathname: "/(tabs)/(incidents)/(photos)/add",
    });
  };

  const handleAddNote = (note: { text: string; timestamp: string }) => {
    setNotes([...notes, note]);
  };

  const handleEscalate = () => {
    Alert.alert("Escalate Incident", "Do you want to Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Escalate",
        style: "destructive",
        onPress: () => console.log("Incident escalated"),
      },
    ]);
  };

  const handleContactManager = () => {
    router.push({
      pathname: "/(tabs)/(messages)/new",
    });
  };

  const handleGenerateReport = () => {
    Alert.alert("Generate Report", "Report will be generated", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Generate",
        onPress: () => console.log("Report Generation pressed"),
      },
    ]);
  };

  const handleEditIncident = () => {
    router.push({
      pathname: "/(tabs)/(incidents)/edit",
      params: { incidentId: incident?.id.toString() },
    });
  };

  const isLoading = incidentLoading || propertyLoading;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </View>
    );
  }

  if (incidentError || !incident) {
    return (
      <View className="flex-1 justify-center items-center">
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
    <View className="flex-1">
      <SafeAreaView className="flex-1">
        <BackButton />
        <ScrollView className="flex-1">
          {/* Street View image */}
          {property?.location && !streetViewError ? (
            <Box className="h-48 w-full px-4">
              <StreetViewImage
                latitude={property.location.latitude}
                longitude={property.location.longitude}
                size={{ width: 600, height: 300 }}
                onError={() => setStreetViewError(true)}
              />
              <Badge className="absolute bottom-2 left-4 py-1 px-2 rounded">
                <Text>Incident Location</Text>
              </Badge>
            </Box>
          ) : (
            <Box className="h-48 w-full flex items-center justify-center">
              <IconSymbol name="eye.slash" size={32} color={"gray"} />
              <Text>Location Preview Unavailable</Text>
            </Box>
          )}

          {/* Incident Details */}
          <IncidentDetails
            incident={incident}
            onUpdateStatus={handleUpdateStatus}
          />
          {isStatusUpdating && (
            <Box className="mx-4 mb-4 p-2 bg-blue-100 rounded">
              <Text className="text-blue-800">Updating status...</Text>
            </Box>
          )}

          {isStatusUpdated && (
            <Box className="mx-4 mb-4 p-2 bg-green-100 rounded">
              <Text className="text-green-800">
                Status updated successfully!
              </Text>
            </Box>
          )}

          {statusError && (
            <Box className="mx-4 mb-4 p-2 bg-red-100 rounded">
              <Text className="text-red-800">
                Error updating status: {statusError.message}
              </Text>
            </Box>
          )}

          {/* Photos Section */}
          {incident?.images && (
            <IncidentPhotos
              images={incident?.images}
              onPhotoPress={handlePhotoPress}
            />
          )}

          {/* Notes Section */}
          <IncidentNotes initialNotes={notes} onAddNote={handleAddNote} />

          {/* Action Buttons */}
          <IncidentActions
            incident={incident}
            onEscalate={handleEscalate}
            onContactManager={handleContactManager}
            onGenerateReport={handleGenerateReport}
            onEditIncident={handleEditIncident}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default IncidentsDetailsScreen;
