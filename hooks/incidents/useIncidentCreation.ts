import { useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useNearestProperty } from "@/hooks/useNearestProperty";
import { Property } from "@/lib/@types/properties";

export function useIncidentCreation() {
  const [showPropertySelectionModal, setShowPropertySelectionModal] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use your existing nearest property hook
  const {
    nearestProperty,
    isLoading,
    showModal,
    setShowModal,
    streetViewError,
    setStreetViewError,
    findNearestProperty,
  } = useNearestProperty();

  const handleCreateIncident = async () => {
    setIsProcessing(true);

    try {
      const userLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => null);

      if (!userLocation) {
        setShowPropertySelectionModal(true);
        return;
      }

      const found = await findNearestProperty(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
      );

      if (!found) {
        Alert.alert(
          "No Nearby Properties",
          "No properties were found near your current location.",
          [
            {
              text: "Select a Property",
              onPress: () => setShowPropertySelectionModal(true),
            },
            { text: "Cancel", style: "cancel" },
          ],
        );
      }
    } catch (error) {
      console.error("Error finding nearest property:", error);
      Alert.alert(
        "Location Error",
        "Could not determine your current location.",
        [
          {
            text: "Select a Property",
            onPress: () => setShowPropertySelectionModal(true),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmProperty = () => {
    if (nearestProperty) {
      setShowModal(false);
      router.push({
        pathname: "/(tabs)/(incidents)/[addIncident]",
        params: {
          addIncident: "[addIncident]",
          propertyId: nearestProperty.id.toString(),
        },
      });
    }
  };

  const handleViewAllProperties = () => {
    setShowModal(false);
    setShowPropertySelectionModal(true);
  };

  const handleSelectProperty = (property: Property) => {
    setShowPropertySelectionModal(false);
    router.push({
      pathname: "/(tabs)/(incidents)/[addIncident]",
      params: {
        addIncident: "[addIncident]",
        propertyId: property.id.toString(),
      },
    });
  };

  return {
    nearestProperty,
    isLoading,
    isProcessing,
    showModal,
    setShowModal,
    showPropertySelectionModal,
    setShowPropertySelectionModal,
    streetViewError,
    setStreetViewError,
    handleCreateIncident,
    handleConfirmProperty,
    handleViewAllProperties,
    handleSelectProperty,
  };
}
