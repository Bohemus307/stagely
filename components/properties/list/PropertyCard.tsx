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
import { Property } from "@/lib/@types/properties";

// Props for components
interface PropertyCardProps {
  property: Property;
  onPress: (property: Property) => void;
  onDetailsPress: (property: Property) => void;
  onPhotosPress: (property: Property) => void;
  onDocumentsPress: (property: Property) => void;
  selectionMode?: boolean;
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
  selectionMode = false,
}) => {
  // Initialize with true if there's no valid location data
  const [streetViewError, setStreetViewError] = useState(
    !property.latitude ||
      typeof property.latitude !== "number" ||
      typeof property.longitude !== "number",
  );

  // Count active incidents
  const activeIncidents =
    property.incidents?.filter(
      (incident) =>
        incident.status !== "Resolved" && incident.status !== "Closed",
    ).length || 0;

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

  // Dynamic styling based on selection mode
  const cardClassName = selectionMode
    ? "bg-white rounded-xl shadow-lg mb-4 border-2 border-primary-300 hover:border-primary-500"
    : "bg-white rounded-xl shadow-lg mb-4";

  const getCloudFrontUrl = (s3Url: string): string | null => {
    if (!s3Url) return null;
    const s3Key = s3Url.split("amazonaws.com/")[1];
    if (!s3Key) return s3Url;
    return `https://d24y6hzot6c372.cloudfront.net/${s3Key}`;
  };

  // Function to render the street view image or unavailable placeholder
  const renderPropertyImage = () => {
    // Show custom uploaded image if available
    if (property.imageUrl) {
      console.log("Using custom uploaded image");
      const imageUrl = getCloudFrontUrl(property.imageUrl);
      if (imageUrl) {
        return (
          <Box className="relative h-full w-full">
            <Image
              source={{ uri: imageUrl }}
              alt="Property Image"
              className="h-full w-full object-cover"
              onError={(error) => {
                console.log("Custom image failed to load:", error);
              }}
            />
          </Box>
        );
      }
    }
    // Fall back to Street View if we have coordinates and no street view error
    if (property.latitude && !streetViewError) {
      return (
        <Box className="relative h-full w-full">
          <StreetViewImage
            latitude={property.latitude}
            longitude={property.longitude}
            size={{ width: 200, height: 200 }}
            onError={() => {
              setStreetViewError(true);
            }}
          />
          <Badge className="absolute bottom-0 left-0 bg-primary-400/70 text-white text-xs py-0.5 px-1 rounded-tr">
            <Text className="text-white text-xs">Street View</Text>
          </Badge>
        </Box>
      );
    }

    // Show placeholder when no image available
    return (
      <Box className="h-full w-full bg-secondary-100 flex items-center justify-center flex-col">
        <IconSymbol name="eye.slash" size={24} color="gray" />
        <Text className="text-xs text-gray-500 mt-1 text-center">No Image</Text>
      </Box>
    );
  };
  return (
    <Pressable onPress={() => onPress(property)} className={cardClassName}>
      <Box className="rounded-lg shadow-lg overflow-hidden bg-white">
        {/* Main Card Content - Horizontal layout */}
        <HStack className="p-4 justify-between items-center">
          {/* Left: Property Image or Street View */}
          <Box className="h-24 w-24 rounded-md overflow-hidden mr-4 flex-shrink-0">
            {renderPropertyImage()}

            {/* Show Preview Unavailable badge when street view errors */}
            {streetViewError && (
              <Badge className="absolute bottom-0 left-0 bg-amber-400/70 text-white text-xs py-0.5 px-1 rounded-tr">
                <Text className="text-xs">No Preview</Text>
              </Badge>
            )}
          </Box>

          {/* Middle: Address and Details */}
          <VStack className="flex-1 mr-4">
            <Heading className="text-lg font-semibold">
              {property.address}
            </Heading>
            <Text>{`${property.city}, ${property.state} ${property.zipCode}`}</Text>
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

          {/* Right: Status Badge */}
          <VStack className="flex-shrink-0 h-full justify-start">
            <Badge
              className={`${statusBadge.color} text-white py-1 px-3 rounded-full flex-shrink-0 mt-0`}
            >
              <Text>{statusBadge.text}</Text>
            </Badge>
          </VStack>
        </HStack>

        {/* Bottom Buttons - Only show if not in selection mode */}
        {!selectionMode && (
          <Box className="border-t-2 border-primary-100">
            <HStack className="bg-white">
              <Pressable
                className="flex-1 py-3 flex items-center justify-center border-r border-primary-100"
                onPress={() => onDetailsPress(property)}
              >
                <Text className="text-sm font-medium text-primary-700">
                  Details
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 py-3 flex items-center justify-center border-r border-primary-100"
                onPress={() => onPhotosPress(property)}
              >
                <Text className="text-sm font-medium text-primary-700">
                  Photos
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 py-3 flex items-center justify-center"
                onPress={() => onDocumentsPress(property)}
              >
                <Text className="text-sm font-medium text-primary-700">
                  Documents
                </Text>
              </Pressable>
            </HStack>
          </Box>
        )}
      </Box>
    </Pressable>
  );
};

export default PropertyCard;
