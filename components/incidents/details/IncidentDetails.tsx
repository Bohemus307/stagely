import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/components/properties/lib/utils/detailsHelpers";
import { getSeverityBadge } from "@/components/properties/lib/utils/detailsHelpers";
import { Incident } from "../data/incidents";

interface IncidentDetailsProps {
  incident: Incident;
}

const IncidentDetails: React.FC<IncidentDetailsProps> = ({ incident }) => {
  return (
    <Box className="bg-white mx-4 p-4 rounded-lg shadow-sm mb-4">
      <ThemedText className="font-bold text-lg mb-3">
        Incident Details
      </ThemedText>

      <VStack className="space-y-3">
        <HStack className="justify-between">
          <ThemedText className="text-gray-500">Priority</ThemedText>
          <Badge className={getSeverityBadge(incident.severity)}>
            <ThemedText className="text-xs">{incident.severity}</ThemedText>
          </Badge>
        </HStack>

        <Divider className="bg-gray-200" />

        <HStack className="justify-between">
          <ThemedText className="text-gray-500">Status</ThemedText>
          <ThemedText className="font-medium">{incident.status}</ThemedText>
        </HStack>

        <Divider className="bg-gray-200" />

        <HStack className="justify-between">
          <ThemedText className="text-gray-500">Reported On</ThemedText>
          <ThemedText className="font-medium">
            {formatDate(incident.reported_at)}
          </ThemedText>
        </HStack>

        {incident.resolved_at && (
          <>
            <Divider className="bg-gray-200" />
            <HStack className="justify-between">
              <ThemedText className="text-gray-500">Resolved On</ThemedText>
              <ThemedText className="font-medium">
                {formatDate(incident.resolved_at)}
              </ThemedText>
            </HStack>
          </>
        )}

        <Divider className="bg-gray-200" />

        <HStack className="justify-between">
          <ThemedText className="text-gray-500">Incident ID</ThemedText>
          <ThemedText className="font-medium">
            #{incident.incident_id}
          </ThemedText>
        </HStack>
      </VStack>
    </Box>
  );
};

export default IncidentDetails;
