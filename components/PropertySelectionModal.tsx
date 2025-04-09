import React, { useEffect, useState } from "react";
import { FlatList, Text, View, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalCloseButton,
} from "@/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useGetProperties } from "@/hooks/properties/useGetProperties";
import { Property } from "@/lib/@types/properties";

interface PropertySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProperty: (property: Property) => void;
}

const PropertySelectionModal: React.FC<PropertySelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectProperty,
}) => {
  const { properties, isLoading, error } = useGetProperties({
    status: "Active",
    limit: 50,
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedPropertyId(null);
    }
  }, [isOpen]);

  const handlePropertySelect = (property: Property) => {
    setSelectedPropertyId(property.id);
  };

  const handleConfirm = () => {
    if (selectedPropertyId && properties) {
      const propertiesArray = Array.isArray(properties)
        ? properties
        : (properties as any)?.data || [];

      const selectedProperty = propertiesArray.find(
        (p: { id: number }) => p.id === selectedPropertyId,
      );

      if (selectedProperty) {
        onSelectProperty(selectedProperty);
        onClose();
      }
    }
  };

  const renderPropertyItem = ({ item }: { item: Property }) => {
    const isSelected = item.id === selectedPropertyId;

    return (
      <TouchableOpacity
        onPress={() => handlePropertySelect(item)}
        className={`mb-2 p-3 rounded-lg border ${isSelected ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white"}`}
      >
        <HStack className="items-start">
          {/* Property Details */}
          <VStack className="flex-1">
            <Text className="font-bold text-typography-900">
              {item.address}
            </Text>
            <Text className="text-typography-500 text-sm">
              {item.city}, {item.state || ""} {item.zipCode || ""}
            </Text>
          </VStack>

          {isSelected && (
            <Box className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
              <IconSymbol name="checkmark" size={12} color="white" />
            </Box>
          )}
        </HStack>
      </TouchableOpacity>
    );
  };

  const renderListContent = () => {
    if (isLoading) {
      return (
        <View className="h-64 items-center justify-center p-4">
          <Spinner size="large" />
          <Text className="mt-2 text-typography-500">
            Loading properties...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="h-64 items-center justify-center p-4">
          <IconSymbol name="exclamationmark.triangle" size={32} color="red" />
          <Text className="mt-2 text-red-500">
            {error instanceof Error
              ? error.message
              : "Failed to load properties"}
          </Text>
        </View>
      );
    }

    const propertiesArray = Array.isArray(properties)
      ? properties
      : (properties as any)?.data || [];

    if (!propertiesArray || propertiesArray.length === 0) {
      return (
        <View className="h-64 items-center justify-center p-4">
          <IconSymbol name="building.2" size={32} color="gray" />
          <Text className="mt-2 text-typography-500">
            No active properties found
          </Text>
          <Button
            className="mt-4"
            onPress={() => {
              onClose();
              router.push("/(tabs)/(properties)/addProperty");
            }}
          >
            <ButtonText>Add Property</ButtonText>
          </Button>
        </View>
      );
    }

    return (
      <View className="h-72">
        <FlatList
          data={propertiesArray}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8 }}
        />
      </View>
    );
  };

  const modalSize = Platform.OS === "ios" ? "lg" : "md";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Select Property</Heading>
          <ModalCloseButton>
            <Icon as={CloseIcon} />
          </ModalCloseButton>
        </ModalHeader>

        <Box className="px-4">{renderListContent()}</Box>

        <ModalFooter>
          <Button
            variant="outline"
            action="secondary"
            onPress={onClose}
            className="mr-2"
          >
            <ButtonText>Cancel</ButtonText>
          </Button>
          <Button onPress={handleConfirm} isDisabled={!selectedPropertyId}>
            <ButtonText>Confirm</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PropertySelectionModal;
