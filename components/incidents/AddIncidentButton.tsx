import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Text } from "react-native";
import * as Location from "expo-location";
import { Button, ButtonText } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@/components/ui/modal";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import Constants from "expo-constants";
import { properties } from "../properties/data/properties";
import { Property } from "../properties/list";

export default function AddIncidentButton() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [nearestProperty, setNearestProperty] = useState<Property | null>(null);
  const [streetViewError, setStreetViewError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get Google Maps API key from Expo Constants
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsKey || "";

  // Function to find the nearest property based on current location
  const findNearestProperty = (
    latitude: number,
    longitude: number,
  ): Property | null => {
    if (!properties || properties.length === 0) {
      return null;
    }

    let nearestProp: Property | null = null;
    let minDistance = Number.MAX_VALUE;

    properties.forEach((property) => {
      if (property.location) {
        // Simple distance calculation
        const latDiff = Math.abs(latitude - property.location.latitude);
        const lngDiff = Math.abs(longitude - property.location.longitude);
        const distance = latDiff + lngDiff;

        if (distance < minDistance) {
          minDistance = distance;
          nearestProp = property;
        }
      }
    });

    return nearestProp;
  };

  const handlePress = async () => {
    setIsLoading(true);
    setStreetViewError(false);

    try {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Denied",
          "Please enable location services to automatically detect nearby properties.",
          [
            {
              text: "View All Properties",
              onPress: () => router.push("/(tabs)/(properties)"),
            },
            { text: "Cancel", style: "cancel" },
          ],
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync();

      // Find nearest property
      const nearest = findNearestProperty(
        location.coords.latitude,
        location.coords.longitude,
      );

      if (nearest) {
        setNearestProperty(nearest);

        // Pre-check if the property has valid location data
        setStreetViewError(
          !nearest.location ||
            typeof nearest.location.latitude !== "number" ||
            typeof nearest.location.longitude !== "number",
        );

        setShowModal(true);
      } else {
        Alert.alert(
          "No Properties Found",
          "No properties were found near your current location.",
          [
            {
              text: "View All Properties",
              onPress: () => router.push("/(tabs)/(properties)"),
            },
            { text: "Cancel", style: "cancel" },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        `Location Error ${error}`,
        "Could not determine your current location.",
        [
          {
            text: "View All Properties",
            onPress: () => router.push("/(tabs)/(properties)"),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmProperty = () => {
    if (nearestProperty) {
      Alert.alert(
        "Property Confirmed",
        `You've selected: ${nearestProperty.address}, ${nearestProperty.city}`,
      );
      setShowModal(false);
      router.push("/(tabs)/(dashboard)/addIncident");
    }
  };

  const handleViewAllProperties = () => {
    setShowModal(false);
    router.push("/(tabs)/(properties)");
  };

  // Function to render the property image or unavailable placeholder
  const renderPropertyImage = () => {
    if (nearestProperty?.location && !streetViewError) {
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=200x200&location=${nearestProperty.location.latitude},${nearestProperty.location.longitude}&key=${GOOGLE_MAPS_API_KEY}`;

      return (
        <Box className="relative h-full w-full">
          <Image
            source={{ uri: streetViewUrl }}
            alt="Street View"
            className="h-full w-full object-cover"
            onError={() => setStreetViewError(true)}
          />
          <Badge className="absolute bottom-0 left-0 bg-primary-400/70 px-1 rounded-tr">
            <Text className="text-white text-xs">Street View</Text>
          </Badge>
        </Box>
      );
    }

    // Fallback to placeholder
    return (
      <Box className="h-full w-full bg-secondary-100 flex items-center justify-center">
        <IconSymbol name="eye.slash" size={24} color="gray" />
        <Text className="text-xs text-gray-500 mt-1">No Preview</Text>
      </Box>
    );
  };

  // Get active incidents count
  const getActiveIncidents = (property: Property) => {
    return (
      property.incidents?.filter(
        (incident) =>
          incident.status !== "Resolved" && incident.status !== "Closed",
      ).length || 0
    );
  };

  return (
    <>
      <Button
        className="h-16 w-1/2 rounded-lg flex flex-col items-center justify-center shadow-sm bg-background-50"
        onPress={handlePress}
      >
        <VStack className="items-center justify-center">
          <IconSymbol
            size={18}
            name="exclamationmark.triangle.fill"
            color="grey"
          />
          <ButtonText className="text-primary-500 mt-1">
            {isLoading ? "Locating..." : "New Incident"}
          </ButtonText>
        </VStack>
      </Button>
      {/* <Button
        className="h-16 w-1/2 rounded-lg flex flex-col items-center justify-center shadow-sm bg-background-50"
        onPress={handlePress}
        isDisabled={isLoading}
      >
        <IconSymbol
          size={18}
          name="exclamationmark.triangle.fill"
          color="grey"
        />
        <ButtonText className="text-primary-700">
          {isLoading ? "Locating..." : "New Incident"}
        </ButtonText>
      </Button> */}

      {/* Property Confirmation Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" className="text-typography-950">
              Nearby Property
            </Heading>
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                size="md"
                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700"
              />
            </ModalCloseButton>
          </ModalHeader>

          <ModalBody>
            {nearestProperty && (
              <>
                <HStack className="items-start">
                  {/* Left: Property Image */}
                  <Box className="h-20 w-20 rounded overflow-hidden mr-3">
                    {renderPropertyImage()}
                  </Box>

                  {/* Right: Property Info */}
                  <VStack className="flex-1">
                    <Heading size="sm" className="text-typography-900">
                      {nearestProperty.address}
                    </Heading>
                    <Text className="text-typography-500 text-sm">
                      {nearestProperty.city}, {nearestProperty.state}{" "}
                      {nearestProperty.zip_code}
                    </Text>

                    <HStack className="mt-2 space-x-2">
                      {nearestProperty.status && (
                        <Badge
                          className={
                            nearestProperty.status === "Active"
                              ? "bg-green-500"
                              : nearestProperty.status === "Maintenance"
                                ? "bg-amber-500"
                                : "bg-gray-500"
                          }
                        >
                          <Text className="text-white text-xs">
                            {nearestProperty.status}
                          </Text>
                        </Badge>
                      )}

                      {getActiveIncidents(nearestProperty) > 0 && (
                        <Badge className="bg-red-500">
                          <Text className="text-white text-xs">
                            {getActiveIncidents(nearestProperty)} Issue
                            {getActiveIncidents(nearestProperty) > 1 ? "s" : ""}
                          </Text>
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
                <Text className="text-typography-700 mt-4 text-center">
                  Is this where the incident occurred?
                </Text>
              </>
            )}
          </ModalBody>

          <ModalFooter className="flex items-center justify-center">
            <Button
              variant="outline"
              action="secondary"
              onPress={handleViewAllProperties}
              className="mr-2"
            >
              <ButtonText>All Properties</ButtonText>
            </Button>
            <Button onPress={handleConfirmProperty}>
              <ButtonText>Confirm</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
