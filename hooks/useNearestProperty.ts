import { useState } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { useGetProperties } from "./properties/useGetProperties";
import { Property } from "@/lib/@types/properties";

export function useNearestProperty() {
  const [nearestProperty, setNearestProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [streetViewError, setStreetViewError] = useState(false);

  const {
    properties: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useGetProperties({
    status: "Active",
    limit: 100,
  });

  const findNearestProperty = async (
    latitude: number,
    longitude: number,
  ): Promise<boolean> => {
    setIsLoading(true);
    setStreetViewError(false);

    if (propertiesLoading) {
      Alert.alert(
        "Please Wait",
        "Still loading property data. Please try again in a moment.",
      );
      setIsLoading(false);
      return false;
    }

    if (propertiesError) {
      Alert.alert(
        "Data Error",
        "There was a problem loading property data. Please try again later.",
      );
      setIsLoading(false);
      return false;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Denied",
          "Please enable location services to automatically detect nearby properties.",
        );
        setIsLoading(false);
        return false;
      }

      const location = await Location.getCurrentPositionAsync();

      let nearestProp: Property | null = null;
      let minDistance = Number.MAX_VALUE;

      const properties = (propertiesData?.data as any[]) || [];

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i] as any;

        if (
          !property ||
          typeof property.latitude !== "number" ||
          typeof property.longitude !== "number"
        ) {
          continue;
        }

        const latDiff = Math.abs(location.coords.latitude - property.latitude);
        const lngDiff = Math.abs(
          location.coords.longitude - property.longitude,
        );
        const distance = latDiff + lngDiff;

        if (distance < minDistance) {
          minDistance = distance;
          nearestProp = property as Property;
        }
      }

      if (nearestProp) {
        setNearestProperty(nearestProp);

        const hasValidCoords =
          typeof nearestProp.latitude === "number" &&
          typeof nearestProp.longitude === "number";

        setStreetViewError(!hasValidCoords);
        setShowModal(true);
        setIsLoading(false);
        return true;
      } else {
        Alert.alert(
          "No Properties Found",
          "No properties were found near your current location.",
        );
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert(
        `Location Error`,
        `Could not determine your current location: ${errorMessage}`,
      );
      setIsLoading(false);
      return false;
    }
  };

  return {
    nearestProperty,
    isLoading: isLoading || propertiesLoading,
    showModal,
    setShowModal,
    streetViewError,
    setStreetViewError,
    findNearestProperty,
  };
}
