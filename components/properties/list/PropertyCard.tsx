import React, { useState } from "react";
import { Text } from "react-native";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Pressable } from "@/components/ui/pressable";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Box } from "@/components/ui/box";
import Constants from "expo-constants";
import { Property } from ".";

// Props for components
interface PropertyCardProps {
  property: Property;
  onPress: (property: Property) => void;
  onDetailsPress: (property: Property) => void;
  onPhotosPress: (property: Property) => void;
  onDocumentsPress: (property: Property) => void;
}

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
  // Get API key from Expo Constants
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsKey || "";

  // Log for debugging
  console.log("Street View URL params:", {
    latitude,
    longitude,
    GOOGLE_MAPS_API_KEY: GOOGLE_MAPS_API_KEY ? "Present" : "Missing",
  });

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

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onPress,
  onDetailsPress,
  onPhotosPress,
  onDocumentsPress,
}) => {
  // Initialize with true if there's no valid location data
  const [streetViewError, setStreetViewError] = useState(
    !property.location ||
      typeof property.location.latitude !== "number" ||
      typeof property.location.longitude !== "number"
  );

  // Count active incidents
  const activeIncidents =
    property.incidents?.filter(
      (incident) =>
        incident.status !== "Resolved" && incident.status !== "Closed"
    ).length || 0;

  // For debugging
  console.log("Property location:", property.location);
  console.log("Street View Error State:", streetViewError);

  // Determine status badge color and text based on property status
  const getStatusBadge = () => {
    const status = property.status || "Active"; // Default to "Active" if status is not defined

    switch (status) {
      case "Archived":
        return { text: "Archived", color: "bg-gray-400/80" };
      case "Maintenance":
        return { text: "Maintenance", color: "bg-amber-400/80" };
      case "Active":
      default:
        return { text: "Active", color: "bg-green-400/80" };
    }
  };

  const statusBadge = getStatusBadge();

  // Function to render the street view image or unavailable placeholder
  const renderPropertyImage = () => {
    console.log("Rendering property image");

    // If we have location and street view hasn't errored
    if (property.location && !streetViewError) {
      console.log("Attempting to use Street View");
      return (
        <Box className="relative h-full w-full">
          <StreetViewImage
            latitude={property.location.latitude}
            longitude={property.location.longitude}
            size={{ width: 200, height: 200 }}
            onError={() => {
              console.log("Setting street view error to true");
              setStreetViewError(true);
            }}
          />
        </Box>
      );
    }

    // Fallback to placeholder with message
    console.log("Showing error state");
    return (
      <Box className="h-full w-full bg-gray-100 flex items-center justify-center flex-col">
        <IconSymbol name="eye.slash" size={24} color="gray" />
        <Text className="text-xs text-gray-500 mt-1 text-center">
          Preview Unavailable
        </Text>
      </Box>
    );
  };

  return (
    <Box className="rounded-lg shadow-lg overflow-hidden bg-white border border-slate-100">
      {/* Main Card Content - Horizontal layout */}
      <HStack className="p-4 justify-between items-center">
        {/* Left: Property Image or Street View */}
        <Box className="h-24 w-24 rounded-md overflow-hidden mr-4 flex-shrink-0">
          {renderPropertyImage()}

          {/* Show Street View indicator if using street view */}
          {!streetViewError && property.location && (
            <Badge className="absolute bottom-0 left-0 bg-blue-400/70 text-white text-xs py-0.5 px-1 rounded-tr">
              <Text className="text-white text-xs">Street View</Text>
            </Badge>
          )}

          {/* Show Preview Unavailable badge when street view errors */}
          {streetViewError && (
            <Badge className="absolute bottom-0 left-0 bg-amber-400/70 text-white text-xs py-0.5 px-1 rounded-tr">
              <Text className="text-white text-xs">No Preview</Text>
            </Badge>
          )}
        </Box>

        {/* Middle: Address and Details */}
        <VStack className="flex-1 mr-4">
          <Heading className="text-lg font-semibold">
            {property.address}
          </Heading>
          <HStack className="items-center text-sm text-gray-500 mt-1">
            <IconSymbol name="location.fill" size={14} color="gray" />
            <Text className="ml-1">
              {property.city}, {property.state} {property.zip_code}
            </Text>
          </HStack>
          <HStack className="items-center mt-2 space-x-2">
            {activeIncidents > 0 && (
              <Badge className="bg-red-100/80 py-0.5 px-2 rounded">
                <Text className="text-xs text-red-500/90">
                  {activeIncidents} Issue{activeIncidents > 1 ? "s" : ""}
                </Text>
              </Badge>
            )}
          </HStack>
        </VStack>

        {/* Right: Status Badge - Moved higher in the same column */}
        <VStack className="flex-shrink-0 h-full justify-start">
          <Badge
            className={`${statusBadge.color} text-white py-1 px-3 rounded-full flex-shrink-0 mt-0`}
          >
            <Text>{statusBadge.text}</Text>
          </Badge>
        </VStack>
      </HStack>

      {/* Bottom Buttons - White background with divider above */}
      <Box className="border-t-2 border-slate-100">
        <HStack className="bg-white">
          <Pressable
            className="flex-1 py-3 flex items-center justify-center border-r border-slate-100"
            onPress={() => onDetailsPress(property)}
          >
            <Text className="text-sm font-medium text-gray-700">Details</Text>
          </Pressable>
          <Pressable
            className="flex-1 py-3 flex items-center justify-center border-r border-slate-100"
            onPress={() => onPhotosPress(property)}
          >
            <Text className="text-sm font-medium text-gray-700">Photos</Text>
          </Pressable>
          <Pressable
            className="flex-1 py-3 flex items-center justify-center"
            onPress={() => onDocumentsPress(property)}
          >
            <Text className="text-sm font-medium text-gray-700">Documents</Text>
          </Pressable>
        </HStack>
      </Box>
    </Box>
  );
};

export default PropertyCard;