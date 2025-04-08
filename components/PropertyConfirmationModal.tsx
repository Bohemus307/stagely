// components/PropertyConfirmationModal.tsx
import React from "react";
import { Text } from "react-native";
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
import { Button, ButtonText } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import Constants from "expo-constants";
import { Property } from "@/lib/@types/properties";

interface PropertyConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onConfirm: () => void;
  onViewAll: () => void;
  streetViewError: boolean;
  setStreetViewError: (error: boolean) => void;
}

export default function PropertyConfirmationModal({
  isOpen,
  onClose,
  property,
  onConfirm,
  onViewAll,
  streetViewError,
  setStreetViewError,
}: PropertyConfirmationModalProps) {
  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsKey || "";

  const renderPropertyImage = () => {
    if (property?.latitude && property?.longitude && !streetViewError) {
      const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=200x200&location=${property.latitude},${property.longitude}&key=${GOOGLE_MAPS_API_KEY}`;

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

    return (
      <Box className="h-full w-full bg-secondary-100 flex items-center justify-center">
        <IconSymbol name="eye.slash" size={24} color="gray" />
        <Text className="text-xs text-gray-500 mt-1">No Preview</Text>
      </Box>
    );
  };

  const getActiveIncidents = (property: Property) => {
    return property.openIncidentCount || 0;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
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
          {property && (
            <>
              <HStack className="items-start">
                <Box className="h-20 w-20 rounded overflow-hidden mr-3">
                  {renderPropertyImage()}
                </Box>

                <VStack className="flex-1">
                  <Heading size="sm" className="text-typography-900">
                    {property.address}
                  </Heading>
                  <Text className="text-typography-500 text-sm">
                    {property.city}, {property.state} {property.zipCode}
                  </Text>

                  <HStack className="mt-2 space-x-2">
                    {property.status && (
                      <Badge
                        className={
                          property.status === "Active"
                            ? "bg-green-500 rounded-2xl"
                            : property.status === "Maintenance"
                              ? "bg-amber-500 rounded-2xl"
                              : "bg-gray-500 rounded-2xl"
                        }
                      >
                        <Text className="text-white text-xs">
                          {property.status}
                        </Text>
                      </Badge>
                    )}

                    {getActiveIncidents(property) > 0 && (
                      <Badge className="bg-red-500">
                        <Text className="text-white text-xs">
                          {getActiveIncidents(property)} Issue
                          {getActiveIncidents(property) > 1 ? "s" : ""}
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
            onPress={onViewAll}
            className="mr-2"
          >
            <ButtonText>All Properties</ButtonText>
          </Button>
          <Button onPress={onConfirm}>
            <ButtonText>Confirm</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
