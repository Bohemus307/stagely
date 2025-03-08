import React from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge } from "@/components/ui/badge";
import { Pressable } from "@/components/ui/pressable";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Box } from "@/components/ui/box";
import { Incident } from "../data/incidents";
import { ThemedText } from "@/components/ThemedText";
import { properties } from "@/components/properties/data/properties";
import { Text } from "react-native";
import {
  getIncidentStatusBadge,
  getStatusIcon,
  getTimeAgo,
} from "../lib/utils/detailsHelpers";

interface IncidentCardProps {
  incident: Incident;
  onPress: (incident: Incident) => void;
  onDetailsPress: (incident: Incident) => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onPress,
  onDetailsPress,
}) => {
  // Helper function to get property name from property ID
  const getPropertyName = (propertyId: number) => {
    const property = properties.find((p) => p.property_id === propertyId);
    if (property) {
      return `${property.address}, ${property.city}`;
    }
    return `Property #${propertyId}`;
  };

  const statusIcon = getStatusIcon(incident.status, incident.severity);
  const isUrgent =
    incident.severity === "High" || incident.severity === "Critical";
  const displayStatus = isUrgent ? "Urgent" : incident.status;
  const badgeClass = getIncidentStatusBadge(displayStatus);

  return (
    <Box className="rounded-lg shadow-sm overflow-hidden bg-white px-3 py-2 -mr-2 -ml-2">
      <HStack className="items-start">
        {/* Content */}
        <VStack className="flex-1">
          {/* Incident title */}
          <HStack className="justify-between items-center">
            <Box
              className="h-8 w-8 rounded-full flex-shrink-0 flex justify-center items-center"
              style={{ backgroundColor: `${statusIcon.color}20` }}
            >
              <IconSymbol
                name={statusIcon.name}
                size={16}
                color={statusIcon.color}
              />
            </Box>
            <ThemedText type="defaultSemiBold" className="flex-1 ml-2">
              {incident.incident_type}
            </ThemedText>
            <Badge className={badgeClass}>
              <Text className="text-xs font-medium">{displayStatus}</Text>
            </Badge>
          </HStack>

          {/* Property info with icon */}
          <HStack className="items-center mt-1 ml-8">
            <IconSymbol name="building.2.fill" size={14} color="gray" />
            <ThemedText type="default" className="ml-1">
              {getPropertyName(incident.property_id)}
            </ThemedText>
          </HStack>
        </VStack>
      </HStack>

      {/* Bottom row with time ago and view details */}
      <HStack className="justify-between items-center mt-2">
        {/* Time ago with icon */}
        <HStack className="items-center">
          <IconSymbol name="clock" size={14} color="gray" />
          <ThemedText type="link" className="ml-1">
            {getTimeAgo(incident.reported_at)}
          </ThemedText>
        </HStack>

        {/* View Details link */}
        <Pressable onPress={() => onDetailsPress(incident)}>
          <ThemedText type="default">View Details</ThemedText>
        </Pressable>
      </HStack>
    </Box>
  );
};

export default IncidentCard;
