import React from "react";
import { View, Alert } from "react-native";
import { router } from "expo-router";
import LocationSearchMap from "@/components/LocationSearchMap";
import BackButton from "@/components/BackButton";
import { useCreateProperty } from "@/hooks/properties/useCreateProperty";
import { Location } from "@/lib/@types/properties";

export default function AddProperty() {
  // Initialize our property creation mutation hook
  const {
    createProperty,
    isError,
    error,
    isSuccess,
    data: createdProperty,
  } = useCreateProperty();

  // Function to extract address components
  const parseAddress = (address: string) => {
    // This is a simple implementation - you might want to enhance it
    // or use the Google Places API for more accurate parsing
    const parts = address.split(",").map((part) => part.trim());

    // Very basic parsing - in production, you'd want more robust logic
    return {
      address: parts[0] || "",
      city: parts.length > 1 ? parts[1] : "",
      state: parts.length > 2 ? parts[2].split(" ")[0] : "",
      zipCode: parts.length > 2 ? parts[2].split(" ")[1] || "" : "",
      country: parts.length > 3 ? parts[3] : "",
    };
  };

  const handleLocationSave = async (location: Location, address: string) => {
    try {
      // Parse address into components
      const addressComponents = parseAddress(address);

      // Create the property using our mutation
      createProperty({
        address: address,
        city: addressComponents.city,
        state: addressComponents.state,
        zipCode: addressComponents.zipCode,
        country: addressComponents.country,
        latitude: location.latitude,
        longitude: location.longitude,
        status: "Active",
      });

      console.log("Location saved:", location);
      console.log("Address:", address);
    } catch (error) {
      console.error("Error saving location:", error);
      // Handle error appropriately
    }
  };

  // Effect to handle successful property creation
  React.useEffect(() => {
    if (isSuccess && createdProperty) {
      console.log("Property created successfully:", createdProperty);
      // Navigate back on success
      router.back();
    }
  }, [isSuccess, createdProperty]);

  // Effect to handle property creation errors
  React.useEffect(() => {
    if (isError && error) {
      console.error("Error creating property:", error);
      Alert.alert("Error", `Failed to create property: ${error.message}`, [
        { text: "OK" },
      ]);
    }
  }, [isError, error]);

  return (
    <>
      <View className="px-5 w-full z-10 shadow-sm">
        <BackButton />
      </View>
      <View className="flex-1 w-full">
        <LocationSearchMap onSaveLocation={handleLocationSave} />
      </View>
    </>
  );
}
