import { useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge } from "@/components/ui/badge";
import { Pressable } from "@/components/ui/pressable";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Box } from "@/components/ui/box";
import { properties } from "@/components/properties/data/properties";
import { Text } from "react-native";
import { Image } from "@/components/ui/image";
import Constants from "expo-constants";
import {
  getIncidentStatusBadge,
  getTimeAgo,
} from "../lib/utils/incidentHelpers";
import { Heading } from "@/components/ui/heading";
import { Incident } from "@/lib/@types/properties";

// Street View Image Component
interface StreetViewImageProps {
  latitude: number;
  longitude: number;
  size?: {
    width: number;
    height: number;
  };
  onError?: () => void;
}

const StreetViewImage: React.FC<StreetViewImageProps> = ({
  latitude,
  longitude,
  size = { width: 96, height: 96 },
  onError,
}) => {
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsKey || "";

  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=${size.width}x${size.height}&location=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <Image
      source={{ uri: streetViewUrl }}
      alt="Street View"
      className="h-full w-full object-cover"
      onError={() => {
        console.log("Street View image failed to load");
        onError && onError();
      }}
    />
  );
};

export interface IncidentCardProps {
  incident: Incident;
  onPress: (incident: Incident) => void;
  onDetailsPress: (incident: Incident) => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onPress,
  onDetailsPress,
}) => {
  // Find the associated property
  const property = properties.find(
    (p) => p.property_id === incident.propertyId,
  );

  // Initialize street view error state
  const [streetViewError, setStreetViewError] = useState(
    !property?.location ||
      typeof property?.location.latitude !== "number" ||
      typeof property?.location.longitude !== "number",
  );

  // Helper function to get property name from property ID
  const getPropertyName = () => {
    if (property) {
      return `${property.address}, ${property.city}`;
    }
    return `Property #${incident.propertyId}`;
  };

  const isUrgent =
    incident.severity === "High" || incident.severity === "Critical";
  const displayStatus = isUrgent ? "Urgent" : incident.status;
  const badgeClass = getIncidentStatusBadge(displayStatus);

  // Function to render the street view image or unavailable placeholder
  const renderPropertyImage = () => {
    // If we have location and street view hasn't errored
    if (property?.location && !streetViewError) {
      return (
        <Box className="relative h-full w-full">
          <StreetViewImage
            latitude={property.location.latitude}
            longitude={property.location.longitude}
            size={{ width: 200, height: 200 }}
            onError={() => {
              setStreetViewError(true);
            }}
          />
        </Box>
      );
    }

    // Fallback to placeholder with message
    return (
      <Box className="h-full w-full bg-secondary-100 flex items-center justify-center flex-col">
        <IconSymbol name="eye.slash" size={24} color="gray" />
        <Text className="text-xs text-gray-500 mt-1 text-center">
          Preview Unavailable
        </Text>
      </Box>
    );
  };

  return (
    <Box className="rounded-lg shadow-lg overflow-hidden bg-white">
      {/* Main Card Content - Match PropertyCard padding */}
      <HStack className="p-4 justify-between items-center">
        {/* Left: Property Image or Street View - Match PropertyCard height */}
        <Box className="h-24 w-24 rounded-md overflow-hidden mr-4 flex-shrink-0">
          {renderPropertyImage()}

          {!streetViewError && property?.location && (
            <Badge className="absolute bottom-0 left-0 bg-primary-400/70 text-white text-xs py-0.5 px-1 rounded-tr">
              <Text className="text-white text-xs">Street View</Text>
            </Badge>
          )}

          {streetViewError && (
            <Badge className="absolute bottom-0 left-0 bg-amber-400/70 text-white text-xs py-0.5 px-1 rounded-tr">
              <Text className="text-xs">No Preview</Text>
            </Badge>
          )}
        </Box>

        <VStack className="flex-1 mr-4">
          <Heading className="text-lg font-semibold">
            {incident.incidentType}
          </Heading>

          <HStack className="items-center text-sm text-primary-500 mt-1">
            <Text className="ml-1">{getPropertyName()}</Text>
          </HStack>

          <HStack className="items-center mt-2 space-x-2">
            <Badge className="py-0.5 px-2">
              <HStack className="items-center">
                <IconSymbol name="clock" size={12} color="gray" />
                <Text className="text-xs text-secondary-500 ml-1">
                  {getTimeAgo(incident.reportedAt)}
                </Text>
              </HStack>
            </Badge>
          </HStack>
        </VStack>

        <VStack className="flex-shrink-0 h-full justify-start">
          <Badge
            className={`${badgeClass} text-white py-1 px-3 rounded-full flex-shrink-0 mt-0`}
          >
            <Text>{displayStatus}</Text>
          </Badge>
        </VStack>
      </HStack>

      <Box className="border-t-2 border-primary-100">
        <HStack className="bg-white">
          <Pressable
            className="flex-1 py-3 flex items-center justify-center"
            onPress={() => onDetailsPress(incident)}
          >
            <Text className="text-sm font-medium text-primary-700">
              View Details
            </Text>
          </Pressable>
        </HStack>
      </Box>
    </Box>
  );
};

export default IncidentCard;
