import React, { useState } from "react";
import {
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
} from "react-native";
import * as Location from "expo-location";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Badge } from "@/components/ui/badge";
import { Colors } from "@/constants/Colors";
import { Property } from "@/lib/@types/properties";

interface PropertySelectorProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  loading?: boolean;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  loading = false,
}) => {
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [propertiesWithDistance, setPropertiesWithDistance] = useState<
    (Property & { distance?: number })[]
  >([]);

  // Calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user location
  const getUserLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to find nearby properties",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location);

      // Calculate distances for all properties
      const withDistance = properties.map((prop) => ({
        ...prop,
        distance: calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          prop.latitude,
          prop.longitude,
        ),
      }));

      // Sort by distance
      withDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      setPropertiesWithDistance(withDistance);
    } catch (error) {
      Alert.alert("Error", "Failed to get your location. Please try again.");
      console.error("Location error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  // Filter properties based on search
  const filteredProperties =
    propertiesWithDistance.length > 0 ? propertiesWithDistance : properties;

  // Format distance for display
  const formatDistance = (distance?: number) => {
    if (!distance) return "";
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500 rounded-xl";
      case "Maintenance":
        return "bg-amber-500 rounded-xl";
      default:
        return "bg-gray-500 rounded-xl";
    }
  };

  return (
    <Box className="flex-1">
      {/* Location Button */}
      <Pressable
        onPress={getUserLocation}
        disabled={locationLoading}
        className="mx-4 mb-4 bg-primary-50 p-4 rounded-lg flex-row items-center"
      >
        {locationLoading ? (
          <ActivityIndicator size="small" color={Colors.light.tint} />
        ) : (
          <IconSymbol
            name="location.fill"
            size={24}
            color={Colors.light.tint}
          />
        )}
        <ThemedText className="ml-3 text-primary-600 font-medium">
          {locationLoading
            ? "Getting location..."
            : userLocation
              ? "Sorted by distance"
              : "Use My Current Location"}
        </ThemedText>
        {userLocation && (
          <IconSymbol
            name="checkmark.circle.fill"
            size={20}
            color={Colors.light.tint}
            style={{ marginLeft: "auto" }}
          />
        )}
      </Pressable>

      {/* Properties List */}
      {loading ? (
        <Box className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <ThemedText className="mt-2">Loading properties...</ThemedText>
        </Box>
      ) : filteredProperties.length === 0 ? (
        <Box className="flex-1 justify-center items-center px-6">
          <IconSymbol
            name="building.2"
            size={48}
            color={Colors.light.tabIconDefault}
          />
          <ThemedText className="text-lg font-semibold mt-4">
            No Properties Found
          </ThemedText>
        </Box>
      ) : (
        <ScrollView>
          <Box className="px-4">
            {/* Nearby Properties Section */}
            {userLocation && propertiesWithDistance.slice(0, 3).length > 0 && (
              <>
                <ThemedText className="text-sm font-semibold text-gray-600 mb-2">
                  NEAREST PROPERTIES
                </ThemedText>
                {propertiesWithDistance.slice(0, 3).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isSelected={selectedProperty?.id === property.id}
                    onPress={() => onSelectProperty(property)}
                    distance={property.distance}
                    formatDistance={formatDistance}
                    getStatusColor={getStatusColor}
                    isNearby={true}
                  />
                ))}

                {propertiesWithDistance.length > 3 && (
                  <>
                    <ThemedText className="text-sm font-semibold text-gray-600 mt-4 mb-2">
                      OTHER PROPERTIES
                    </ThemedText>
                    {propertiesWithDistance.slice(3).map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        isSelected={selectedProperty?.id === property.id}
                        onPress={() => onSelectProperty(property)}
                        distance={property.distance}
                        formatDistance={formatDistance}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {/* All Properties (when no location) */}
            {!userLocation &&
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSelected={selectedProperty?.id === property.id}
                  onPress={() => onSelectProperty(property)}
                  formatDistance={formatDistance}
                  getStatusColor={getStatusColor}
                />
              ))}
          </Box>
        </ScrollView>
      )}
    </Box>
  );
};

// Property Card Component
interface PropertyCardProps {
  property: Property & { distance?: number };
  isSelected: boolean;
  onPress: () => void;
  distance?: number;
  formatDistance: (distance?: number) => string;
  getStatusColor: (status: string) => string;
  isNearby?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSelected,
  onPress,
  formatDistance,
  getStatusColor,
  isNearby = false,
}) => (
  <Pressable
    onPress={onPress}
    className={`p-4 rounded-lg border mb-2 ${
      isSelected
        ? "border-primary-500 bg-primary-50"
        : isNearby
          ? "border-primary-300 bg-secondary-50"
          : "border-gray-200 bg-white"
    }`}
  >
    <HStack className="items-start justify-between">
      <VStack className="flex-1">
        <HStack className="items-center mb-1">
          <ThemedText className="font-semibold flex-1">
            {property.address}
          </ThemedText>
          {property.distance && (
            <Badge className="bg-secondary-100 ml-2 rounded-xl mr-4">
              <Text className="text-primary-700 text-xs">
                {formatDistance(property.distance)}
              </Text>
            </Badge>
          )}
        </HStack>
        <ThemedText className="text-gray-600 text-sm">
          {property.city}, {property.state} {property.zipCode}
        </ThemedText>
        {property.openIncidentCount > 0 && (
          <HStack className="items-center mt-2">
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={14}
              color="#EF4444"
            />
            <ThemedText className="text-red-600 text-xs ml-1">
              {property.openIncidentCount} open incident
              {property.openIncidentCount > 1 ? "s" : ""}
            </ThemedText>
          </HStack>
        )}
      </VStack>
      <HStack className="items-center gap-2">
        <Badge className={getStatusColor(property.status)}>
          <ThemedText className="text-white text-xs">
            {property.status}
          </ThemedText>
        </Badge>
        {isSelected && (
          <IconSymbol
            name="checkmark.circle.fill"
            size={24}
            color={Colors.light.tint}
          />
        )}
      </HStack>
    </HStack>
  </Pressable>
);
