import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { PropertyStatus } from "@/lib/@types/properties";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { useGetProperty } from "@/hooks/properties/useGetPropertyById";
import { useUpdateProperty } from "@/hooks/properties/useUpdateProperty";
import { useDeleteProperty } from "@/hooks/properties/useDeleteProperty";

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
    data: updatedProperty,
  } = useUpdateProperty(id);

  const {
    deleteProperty,
    isPending: isDeleting,
    isSuccess: deleteSuccess,
    error: deleteError,
  } = useDeleteProperty();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.Active);

  useEffect(() => {
    if (property) {
      setAddress(property.address || "");
      setCity(property.city || "");
      setState(property.state || "");
      setZipCode(property.zipCode || "");
      setCountry(property.country || "");
      setStatus(property.status || PropertyStatus.Active);
    }
  }, [property]);

  useEffect(() => {
    if (isSuccess && updatedProperty) {
      Alert.alert(
        "Property Updated",
        "The property has been successfully updated.",
        [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/(properties)/"),
          },
        ],
      );
    }
  }, [isSuccess, updatedProperty]);

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

  const handleSubmit = () => {
    if (!address.trim()) {
      Alert.alert("Error", "Please enter a street address");
      return;
    }

    if (!city.trim()) {
      Alert.alert("Error", "Please enter a city");
      return;
    }

    if (!country.trim()) {
      Alert.alert("Error", "Please enter a country");
      return;
    }

    updateProperty({
      address,
      city,
      state: state || undefined,
      zipCode: zipCode || undefined,
      country,
      status,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone and will remove all associated data including incidents, inspections, and images.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteProperty(id),
        },
      ],
    );
  };

  if (propertyLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </View>
    );
  }

  if (propertyError || !property) {
    return (
      <View className="flex-1 justify-center items-center">
        <BackButton />
        <Text>
          {propertyError
            ? `Error loading property: ${propertyError.message}`
            : "Property not found"}
        </Text>
        <Button className="mt-4" onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-primary-50">
      <Box className="p-4">
        <BackButton />

        <Heading className="text-xl my-4">Edit Property</Heading>

        {/* Property Form */}
        <Box className="bg-white p-4 rounded-lg shadow-sm mb-6">
          {/* Address */}
          <Box className="mb-4">
            <Text className="font-semibold mb-1">Street Address*</Text>
            <Input className="border border-gray-300">
              <InputField
                placeholder="Enter street address"
                value={address}
                onChangeText={setAddress}
              />
            </Input>
          </Box>

          {/* City */}
          <Box className="mb-4">
            <Text className="font-semibold mb-1">City*</Text>
            <Input className="border border-gray-300">
              <InputField
                placeholder="Enter city"
                value={city}
                onChangeText={setCity}
              />
            </Input>
          </Box>

          {/* State and ZIP Code Row */}
          <HStack className="space-x-2 mb-4">
            <Box className="flex-1">
              <Text className="font-semibold mb-1">State/Province</Text>
              <Input className="border border-gray-300">
                <InputField
                  placeholder="Optional"
                  value={state}
                  onChangeText={setState}
                />
              </Input>
            </Box>

            <Box className="flex-1">
              <Text className="font-semibold mb-1">ZIP/Postal Code</Text>
              <Input className="border border-gray-300">
                <InputField
                  placeholder="Optional"
                  value={zipCode}
                  onChangeText={setZipCode}
                />
              </Input>
            </Box>
          </HStack>

          {/* Status */}
          <Box className="mb-4">
            <Text className="font-semibold mb-1">Property Status*</Text>
            <Select
              selectedValue={status}
              onValueChange={(value) => setStatus(value as PropertyStatus)}
            >
              <SelectTrigger>
                <SelectInput placeholder="Select property status" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <SelectItem label="Active" value={PropertyStatus.Active} />
                  <SelectItem
                    label="Maintenance"
                    value={PropertyStatus.Maintenance}
                  />
                  <SelectItem
                    label="Archived"
                    value={PropertyStatus.Archived}
                  />
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>
        </Box>

        {(isError || deleteError) && (
          <Box className="bg-red-100 p-4 rounded-lg mb-6">
            <Text className="text-red-800">
              {updateError?.message ||
                deleteError?.message ||
                "An error occurred while processing your request"}
            </Text>
          </Box>
        )}

        <HStack className="space-x-2 mb-4">
          <Button
            onPress={handleSubmit}
            isDisabled={isUpdating || isDeleting}
            className="flex-1"
          >
            {isUpdating ? (
              <HStack className="items-center">
                <Spinner color="white" size="small" />
                <ButtonText className="ml-2">Saving...</ButtonText>
              </HStack>
            ) : (
              <ButtonText>Save Changes</ButtonText>
            )}
          </Button>
        </HStack>

        {/* Delete Section */}
        <Box className="bg-white p-4 rounded-lg shadow-sm">
          <Button
            variant="outline"
            action="negative"
            onPress={handleDelete}
            isDisabled={isUpdating || isDeleting}
            className="border-red-300"
          >
            {isDeleting ? (
              <HStack className="items-center">
                <Spinner color="red" size="small" />
                <ButtonText className="ml-2 text-red-600">
                  Deleting...
                </ButtonText>
              </HStack>
            ) : (
              <ButtonText className="text-red-600">Delete Property</ButtonText>
            )}
          </Button>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default PropertyEditScreen;
