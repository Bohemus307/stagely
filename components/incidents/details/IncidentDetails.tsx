import React, { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/components/properties/lib/utils/detailsHelpers";
import { getSeverityBadge } from "@/components/properties/lib/utils/detailsHelpers";
import { Incident } from "@/components/properties/list";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { properties } from "@/components/properties/data/properties";
import { Alert } from "react-native";
import { ButtonText } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

export interface IncidentDetailsProps {
  incident: Incident;
  onUpdateStatus?: (incidentId: number, newStatus: string) => void;
}

const IncidentDetails: React.FC<IncidentDetailsProps> = ({
  incident,
  onUpdateStatus,
}) => {
  const [property, setProperty] = useState<any>(null);
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(incident.status);

  useEffect(() => {
    const fetchData = async () => {
      try {
        //Find associated Property
        const propertyData = properties.find(
          (p) => p.property_id === incident.property_id,
        );
        setProperty(propertyData);
      } catch (error) {
        console.error("Error fetching incident details", error);
        Alert.alert("Error", "Failed to load incident details");
      }
    };

    fetchData();
  }, [incident.property_id]);

  const handleStatusUpdate = () => {
    if (onUpdateStatus && selectedStatus !== incident.status) {
      onUpdateStatus(incident.incident_id, selectedStatus);
    }
    setShowStatusEditor(false);
  };

  const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];

  return (
    <Box className="bg-primary-50 mx-4 p-4 rounded-lg shadow-sm mb-4">
      <ThemedText type="defaultSemiBold" className=" mb-3">
        {incident.incident_type}
      </ThemedText>
      {property && (
        <HStack className="items-center space-x-1 mb-3">
          <IconSymbol name="building.2.fill" size={14} color={"#6b7280"} />
          <ThemedText type="default">
            {property.address}, {property.city}
          </ThemedText>
        </HStack>
      )}

      <HStack className="justify-between items-center">
        <Badge
          className={
            incident.severity === "High" || incident.severity === "Critical"
              ? "bg-red-500 text-white"
              : incident.status === "Resolved"
                ? "bg-green-500 text-white"
                : "bg-amber-500 text-white"
          }
          size="lg"
        >
          <ThemedText className="text-white">
            {incident.severity === "High" || incident.severity === "Critical"
              ? "Urgent"
              : incident.status}
          </ThemedText>
        </Badge>

        <Button
          size="sm"
          variant="outline"
          className="bg-white"
          onPress={() => setShowStatusEditor(!showStatusEditor)}
        >
          <ButtonText>
            {showStatusEditor ? "Cancel" : "Update Status"}
          </ButtonText>
        </Button>
      </HStack>

      {showStatusEditor && (
        <Box className="mt-3 mb-3">
          <ThemedText className="mb-2">Select New Status:</ThemedText>

          <VStack space="sm" className="mb-3">
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "solid" : "outline"}
                size="sm"
                onPress={() => setSelectedStatus(status)}
                className={
                  selectedStatus === status ? "bg-primary-500" : "bg-white"
                }
              >
                <ButtonText
                  className={
                    selectedStatus === status
                      ? "text-white"
                      : "text-primary-500"
                  }
                >
                  {status}
                </ButtonText>
              </Button>
            ))}
          </VStack>

          <Button className="mt-2" size="sm" onPress={handleStatusUpdate}>
            <ButtonText>Save Status</ButtonText>
          </Button>
        </Box>
      )}

      <Box className="mt-4">
        <ThemedText type="default">{incident.description}</ThemedText>
      </Box>

      <Divider className="my-3 bg-gray-200" />

      <VStack className="space-y-3">
        <HStack className="justify-between">
          <ThemedText>Priority</ThemedText>
          <Badge className={getSeverityBadge(incident.severity)}>
            <ThemedText>{incident.severity}</ThemedText>
          </Badge>
        </HStack>

        <HStack className="justify-between">
          <ThemedText>Reported On</ThemedText>
          <ThemedText>{formatDate(incident.reported_at)}</ThemedText>
        </HStack>

        {incident.resolved_at && (
          <>
            <HStack className="justify-between">
              <ThemedText>Resolved On</ThemedText>
              <ThemedText>{formatDate(incident.resolved_at)}</ThemedText>
            </HStack>
          </>
        )}

        <HStack className="justify-between">
          <ThemedText>Incident ID</ThemedText>
          <ThemedText>#{incident.incident_id}</ThemedText>
        </HStack>
      </VStack>
    </Box>
  );
};

export default IncidentDetails;
