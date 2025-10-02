import React, { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { useGetProperty } from "@/hooks/properties/useGetPropertyById";
import { useUpdateProperty } from "@/hooks/properties/useUpdateProperty";
import { useDeleteProperty } from "@/hooks/properties/useDeleteProperty";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Pressable } from "@/components/ui/pressable";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { VStack } from "@/components/ui/vstack";
import { Colors } from "@/constants/Colors";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import LocationSearchMap from "@/components/LocationSearchMap";
import { Location } from "@/lib/@types/properties";
import { getStatusBadge } from "@/components/properties/lib/utils/detailsHelpers";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";

const PropertyEditScreen = () => {
  const { propertyId } = useLocalSearchParams();
  const id = propertyId as string;

  const {
    property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useGetProperty(id);

  const {
    updateProperty,
    isPending: isUpdating,
    isSuccess,
    isError,
    error: updateError,
  } = useUpdateProperty(id);

  const {
    deleteProperty,
    isPending: isDeleting,
    isSuccess: deleteSuccess,
    error: deleteError,
  } = useDeleteProperty();

  const [showAddressView, setShowAddressView] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    property?.status || "Active",
  );

  // Update selectedStatus when property loads
  useEffect(() => {
    if (property?.status) {
      setSelectedStatus(property.status);
    }
  }, [property?.status]);

  useEffect(() => {
    if (isSuccess) {
      // Navigate to property details page after successful update
      router.push({
        pathname: "/(tabs)/(properties)",
        params: { propertyId: id },
      });
    }
  }, [isSuccess, id]);

  useEffect(() => {
    if (deleteSuccess) {
      Alert.alert(
        "Property Deleted",
        "The property has been successfully deleted.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/(properties)/"),
          },
        ],
      );
    }
  }, [deleteSuccess]);

  const parseAddress = (address: string) => {
    const parts = address.split(",").map((part) => part.trim());

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
      const addressComponents = parseAddress(address);

      updateProperty({
        address: address,
        city: addressComponents.city,
        state: addressComponents.state,
        zipCode: addressComponents.zipCode,
        country: addressComponents.country,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert("Error", "Failed to update property location");
    }
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    updateProperty({ status: value });
  };

  const handlePhotoFromCamera = async () => {
    setShowPhotoModal(false);
    console.log("Taking a photo for property:", id);
    // Navigate to camera screen - uncomment when camera route is ready
    // router.push({
    //   pathname: "/properties/[propertyId]/photos/camera",
    //   params: { propertyId: id },
    // });
  };

  const handlePhotoFromGallery = async () => {
    setShowPhotoModal(false);
    router.push({
      pathname: "/(tabs)/(properties)/select",
      params: { propertyId: id },
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(false);
    deleteProperty(id);
  };

  if (propertyLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
        <ThemedText className="mt-4">Loading property...</ThemedText>
      </ThemedView>
    );
  }

  if (propertyError || !property) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-4">
        <BackButton />
        <ThemedText>
          {propertyError
            ? `Error: ${propertyError.message}`
            : "Property not found"}
        </ThemedText>
      </ThemedView>
    );
  }

  if (showAddressView) {
    return (
      <View className="flex-1 mt-4">
        <View className="px-5 w-full z-10 shadow-sm">
          <BackButton />
        </View>
        <View className="flex-1 w-full">
          <LocationSearchMap onSaveLocation={handleLocationSave} />
        </View>
      </View>
    );
  }

  const statusBadge = getStatusBadge(selectedStatus);
  return (
    <ThemedView className="flex-1">
      <SafeAreaView edges={["top"]}>
        <Box className="px-4 py-2 border-b border-gray-200">
          <HStack className="items-center justify-between">
            <BackButton />
          </HStack>
        </Box>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Box className="p-5">
          {/* Error Display */}
          {(isError || deleteError) && (
            <Box className="bg-red-100 p-4 rounded-lg mb-6">
              <ThemedText className="text-red-800">
                {updateError?.message ||
                  deleteError?.message ||
                  "An error occurred"}
              </ThemedText>
            </Box>
          )}

          {/* Status Update Card */}
          <Box className="bg-primary-100 rounded-2xl p-5 mb-5">
            <HStack className="items-center mb-3">
              <Box className="w-10 h-10 bg-primary-700 rounded-xl items-center justify-center mr-4">
                {isUpdating ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <IconSymbol name="flag.fill" size={20} color="white" />
                )}
              </Box>
              <VStack className="flex-1">
                <ThemedText type="defaultSemiBold" className="mb-2">
                  Property Status
                </ThemedText>
                <Select
                  selectedValue={selectedStatus}
                  onValueChange={handleStatusChange}
                  isDisabled={isUpdating || isDeleting}
                >
                  <SelectTrigger variant="outline" size="md">
                    <HStack className="items-center flex-1">
                      <Box className=" py-1 px-3 rounded-full mr-2">
                        <ThemedText className="text-xs">
                          {statusBadge.text}
                        </ThemedText>
                      </Box>
                      <SelectIcon className="ml-auto" as={ChevronDownIcon} />
                    </HStack>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      <SelectItem label="Active" value="Active" />
                      <SelectItem label="Maintenance" value="Maintenance" />
                      <SelectItem label="Archived" value="Archived" />
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </VStack>
            </HStack>
          </Box>

          {/* Address Update Card */}
          <Pressable
            onPress={() => setShowAddressView(true)}
            className="bg-primary-100 rounded-2xl p-5 mb-5"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            disabled={isUpdating || isDeleting}
          >
            <HStack className="items-center mb-3">
              <Box className="w-10 h-10 bg-primary-700 rounded-xl items-center justify-center mr-4">
                {isUpdating ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <IconSymbol name="location" size={20} color="white" />
                )}
              </Box>
              <VStack className="flex-1">
                <ThemedText type="defaultSemiBold">
                  {isUpdating ? "Updating Address..." : "Update Address"}
                </ThemedText>
              </VStack>
              {!isUpdating && (
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={Colors.light.icon}
                />
              )}
            </HStack>
          </Pressable>

          {/* Photo Update Card */}
          <Pressable
            onPress={() => setShowPhotoModal(true)}
            className="bg-primary-100 rounded-2xl p-5 mb-8"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <HStack className="items-center mb-3">
              <Box className="w-10 h-10 bg-primary-700 rounded-xl items-center justify-center mr-4">
                <IconSymbol name="photo" size={20} color="white" />
              </Box>
              <VStack className="flex-1">
                <ThemedText type="defaultSemiBold">
                  Update property image
                </ThemedText>
              </VStack>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors.light.icon}
              />
            </HStack>
          </Pressable>

          <Pressable
            onPress={() => setShowDeleteModal(true)}
            className="bg-primary-100 rounded-2xl p-5 mb-8"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            disabled={isUpdating || isDeleting}
          >
            <HStack className="items-center mb-3">
              <Box className="w-10 h-10 bg-red-600 rounded-xl items-center justify-center mr-4">
                <IconSymbol name="trash" size={20} color="white" />
              </Box>
              <VStack className="flex-1">
                <ThemedText type="defaultSemiBold" className="text-red-600">
                  Delete Property
                </ThemedText>
              </VStack>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors.light.icon}
              />
            </HStack>
          </Pressable>
        </Box>
      </ScrollView>

      {/* Photo Modal */}
      <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)}>
        <ModalBackdrop />
        <ModalContent className="m-4">
          <ModalHeader>
            <Heading size="lg">Change Property Photo</Heading>
            <ModalCloseButton>
              <IconSymbol name="xmark" size={16} color={Colors.light.icon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              <Pressable
                onPress={handlePhotoFromCamera}
                className="bg-gray-200 rounded-xl overflow-hidden"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f8fafc" : "white",
                })}
              >
                <HStack className="flex-row items-center py-5 px-4">
                  <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                    <IconSymbol name="camera.fill" size={24} color="white" />
                  </Box>
                  <VStack>
                    <ThemedText type="defaultSemiBold">Take Photo</ThemedText>
                  </VStack>
                </HStack>
              </Pressable>

              <Pressable
                onPress={handlePhotoFromGallery}
                className="bg-gray-200 rounded-xl overflow-hidden"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f8fafc" : "white",
                })}
              >
                <HStack className="flex-row items-center py-5 px-4">
                  <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                    <IconSymbol
                      name="photo.on.rectangle"
                      size={24}
                      color="white"
                    />
                  </Box>
                  <VStack>
                    <ThemedText type="defaultSemiBold">
                      Upload from Gallery
                    </ThemedText>
                  </VStack>
                </HStack>
              </Pressable>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onPress={() => setShowPhotoModal(false)}
              className="flex-1"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalBackdrop />
        <ModalContent className="m-4">
          <ModalHeader>
            <Heading size="lg" className="text-red-600">
              Delete Property
            </Heading>
            <ModalCloseButton>
              <IconSymbol name="xmark" size={16} color={Colors.light.icon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <ThemedText>
              Are you sure you want to delete this property? This will
              permanently remove all associated data including incidents,
              inspections, and images. This action cannot be undone.
            </ThemedText>
          </ModalBody>
          <ModalFooter>
            <HStack space="md" className="flex-1">
              <Button
                variant="outline"
                onPress={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                action="negative"
                onPress={handleDelete}
                isDisabled={isDeleting}
                className="flex-1"
              >
                <ButtonText>Delete</ButtonText>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ThemedView>
  );
};

export default PropertyEditScreen;
