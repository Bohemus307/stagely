import React, { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Spinner } from "@/components/ui/spinner";
import { properties } from "@/components/properties/data/properties";
import { Property } from "@/components/properties/list";
import BackButton from "@/components/BackButton";

const PropertyEditScreen = () => {
  const { propertyId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // Get the property from the properties data file
        const id = parseInt(propertyId as string);
        const fetchedProperty = properties.find((p) => p.property_id === id);

        if (fetchedProperty) {
          setProperty(fetchedProperty as unknown as Property);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        // Handle the error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
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
        <BackButton />
        <Text>Property not found</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <BackButton />
        <Text>EDIT</Text>
      </SafeAreaView>
    </ThemedView>
  );
};

export default PropertyEditScreen;
