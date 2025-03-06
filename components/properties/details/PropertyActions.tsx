import { Linking, Text } from "react-native";
import React from "react";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Property } from "../list";

type Props = {
  property: Property;
};

const PropertyActions = ({ property }: Props) => {
  // Open Maps app with the location
  const openMaps = () => {
    if (property?.location) {
      const { latitude, longitude } = property.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    }
  };

  const activeIncidents =
    property.incidents?.filter(
      (incident) =>
        incident.status !== "Resolved" && incident.status !== "Closed",
    ).length || 0;

  return (
    <HStack className="mb-6 gap-2 rounded-2xl">
      <Button
        className="flex-1 bg-primary-500 py-2 rounded-md"
        onPress={openMaps}
      >
        <HStack className="items-center justify-center">
          <IconSymbol name="map.fill" size={16} color="white" />
          <Text className="text-white ml-2">Open in Maps</Text>
        </HStack>
      </Button>

      <Button
        className="flex-1 bg-secondary-500 py-2 rounded-md"
        onPress={() =>
          router.push({
            pathname: "/(tabs)/(incidents)",
            params: { propertyId: property.property_id },
          })
        }
      >
        <HStack className="items-center justify-center">
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={16}
            color="white"
          />
          <Text className="text-white ml-2">
            {activeIncidents > 0
              ? `Issues (${activeIncidents})`
              : "Report Issue"}
          </Text>
        </HStack>
      </Button>
    </HStack>
  );
};

export default PropertyActions;
