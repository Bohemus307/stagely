import { useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge } from "@/components/ui/badge";
import {
  getSeverityBadge,
  formatDate,
} from "@/components/properties/lib/utils/detailsHelpers";

import { IconSymbol } from "@/components/ui/IconSymbol";

import { ButtonText } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { getIncidentStatusBadge } from "../lib/utils/incidentHelpers";
import { Incident } from "@/lib/@types/properties";

export interface IncidentDetailsProps {
  incident: Incident;
  onUpdateStatus?: (incidentId: number, newStatus: string) => void;
}

const IncidentDetails: React.FC<IncidentDetailsProps> = ({
  incident,
  onUpdateStatus,
}) => {
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(incident.status);

  const handleStatusUpdate = () => {
    if (onUpdateStatus && selectedStatus !== incident.status) {
      onUpdateStatus(incident.id, selectedStatus);
    }
    setShowStatusEditor(false);
  };

  const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];

  const isUrgent =
    incident.severity === "High" || incident.severity === "Critical";
  const displayStatus = isUrgent ? "Urgent" : incident.status;
  const badgeClass = getIncidentStatusBadge(displayStatus);

  return (
    <Box className="bg-white mx-4 p-4 mt-2 rounded-lg shadow-sm mb-4">
      <HStack className="items-center justify-between mb-3">
        <ThemedText type="defaultSemiBold">{incident.incidentType}</ThemedText>
        <Badge className={badgeClass}>
          <ThemedText>{displayStatus}</ThemedText>
        </Badge>
      </HStack>
      {incident.propertyId && (
        <HStack className="items-center space-x-1 mb-3">
          <IconSymbol name="building.2.fill" size={14} color={"#6b7280"} />
          <ThemedText type="default">
            Property #{incident.propertyId}
          </ThemedText>
        </HStack>
      )}

      <HStack className="justify-between items-center">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 bg-primary-500 py-2 rounded-md"
          onPress={() => setShowStatusEditor(!showStatusEditor)}
        >
          <ButtonText className="text-white">
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
        <ThemedText className="mb-2 font-bold">User Description:</ThemedText>
        <ThemedText type="default">{incident.description}</ThemedText>
      </Box>
      <Box className="mt-4">
        <ThemedText className="mb-2 font-bold">AI Analysis:</ThemedText>
        <ThemedText>{incident?.featureVector?.claudeAnalysis}</ThemedText>
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
          <ThemedText>{formatDate(incident.reportedAt)}</ThemedText>
        </HStack>

        {incident.resolvedAt && (
          <>
            <HStack className="justify-between">
              <ThemedText>Resolved On</ThemedText>
              <ThemedText>{formatDate(incident.resolvedAt)}</ThemedText>
            </HStack>
          </>
        )}

        <HStack className="justify-between">
          <ThemedText>Incident ID</ThemedText>
          <ThemedText>#{incident.id}</ThemedText>
        </HStack>
      </VStack>
    </Box>
  );
};

export default IncidentDetails;
