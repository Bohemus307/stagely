import React, { useEffect, useState } from "react";
import { ScrollView, SafeAreaView, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Button } from "@/components/ui/button";

import { properties } from "@/components/properties/data/properties";
import { Property } from "@/components/properties/list";
import StreetViewImage from "@/components/properties/details/StreetView";
import { Spinner } from "@/components/ui/spinner";
import PropertyInformation from "@/components/properties/details/PropertyInformation";
import BackButton from "@/components/BackButton";

const PropertyDetailsScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [streetViewError, setStreetViewError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      console.log(`Fetching property with ID: ${propertyId}`);

      // In a real app, you would fetch from an API using the propertyId
      // For example:
      // const response = await fetch(`https://your-api.com/properties/${propertyId}`);
      // const data = await response.json();
      // setProperty(data);

      // For now, we'll simulate a fetch with the propertyId
      setTimeout(() => {
        // Find property by ID
        const id = parseInt(propertyId);
        const foundProperty = properties.find((p) => p.property_id === id);
        // temporary "as" until data is real 🤖
        setProperty(foundProperty as Property);
        setLoading(false);
      }, 500);
    };

    if (propertyId) {
      fetchPropertyData();
    } else {
      console.error("No property ID provided in URL parameters");
      setLoading(false);
    }
  }, [propertyId]);

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </ThemedView>
    );
  }

  if (!property) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Text>Property with ID {propertyId} not found</Text>
        <Button
          className="mt-4 px-4 py-2 bg-primary-500 rounded-md"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </Button>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <BackButton />
        <ScrollView className="flex-1">
          {/* Street View Image */}
          {property.location && !streetViewError ? (
            <Box className="h-48 w-full px-2">
              <StreetViewImage
                latitude={property.location.latitude}
                longitude={property.location.longitude}
                size={{ width: 600, height: 300 }}
                onError={() => setStreetViewError(true)}
              />
              <Badge className="absolute bottom-2 left-4 py-1 px-2 rounded">
                <Text className=" text-xs">Street View</Text>
              </Badge>
            </Box>
          ) : (
            <Box className="h-48 w-full flex items-center justify-center">
              <IconSymbol name="eye.slash" size={32} color="gray" />
              <Text className="text-sm text-gray-500 mt-2">
                Preview Unavailable
              </Text>
            </Box>
          )}

          {/* Property Information */}
          <PropertyInformation property={property} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default PropertyDetailsScreen;
