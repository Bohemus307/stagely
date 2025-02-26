import React, { useEffect, useState } from "react";
import { ScrollView, SafeAreaView, Text, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/Header";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronDownIcon } from "@/components/ui/icon";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";

// Define property status enum
enum PropertyStatus {
  Active = "Active",
  Maintenance = "Maintenance",
  Archived = "Archived",
}

// Define the property interface
interface Property {
  property_id: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
}

// Form validation interface
interface FormErrors {
  address?: string;
  city?: string;
  zipCode?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
}

const PropertyEditScreen = () => {
  const { propertyId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.Active);
  const [hasLocation, setHasLocation] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    // In a real app, you would fetch the property data from an API
    // For this example, we'll simulate it with a timeout
    setTimeout(() => {
      // This would be your API fetch in a real implementation
      const exampleProperty: Property = {
        property_id: parseInt(propertyId as string) || 15,
        address: "12 Grimmauld Place",
        city: "London",
        state: "",
        zip_code: "N1",
        country: "UK",
        location: {
          latitude: 51.5358,
          longitude: -0.1034,
        },
        status: PropertyStatus.Active,
        created_at: "2024-11-01T08:30:00Z",
        updated_at: "2025-02-11T03:00:00Z",
      };

      setProperty(exampleProperty);

      // Populate form fields
      setAddress(exampleProperty.address);
      setCity(exampleProperty.city);
      setState(exampleProperty.state);
      setZipCode(exampleProperty.zip_code);
      setCountry(exampleProperty.country);
      setStatus(exampleProperty.status);

      if (exampleProperty.location) {
        setHasLocation(true);
        setLatitude(exampleProperty.location.latitude.toString());
        setLongitude(exampleProperty.location.longitude.toString());
      }

      setLoading(false);
    }, 500);
  }, [propertyId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Required fields validation
    if (!address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (!city.trim()) {
      newErrors.city = "City is required";
      isValid = false;
    }

    if (!zipCode.trim()) {
      newErrors.zipCode = "ZIP/Postal code is required";
      isValid = false;
    }

    if (!country.trim()) {
      newErrors.country = "Country is required";
      isValid = false;
    }

    // Validate coordinates if hasLocation is true
    if (hasLocation) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = "Enter a valid latitude (-90 to 90)";
        isValid = false;
      }

      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = "Enter a valid longitude (-180 to 180)";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Start saving
    setSaving(true);

    // Prepare updated property object
    const updatedProperty = {
      ...property,
      address,
      city,
      state,
      zip_code: zipCode,
      country,
      status,
      location: hasLocation
        ? {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          }
        : undefined,
      updated_at: new Date().toISOString(),
    };

    // Simulate API call
    setTimeout(() => {
      console.log("Saving property:", updatedProperty);
      setSaving(false);

      // Show success message
      Alert.alert("Success", "Property details updated successfully", [
        {
          text: "View Property",
          onPress: () =>
            router.push({
              pathname: "/(tabs)/(properties)/propertyDetails",
              params: { propertyId: property?.property_id },
            }),
        },
      ]);
    }, 1000);
  };

  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Text>Loading property details...</Text>
      </ThemedView>
    );
  }

  if (!property) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Text>Property not found</Text>
        <Button
          className="mt-4 px-4 py-2 bg-blue-500 rounded-md"
          onPress={() => router.back()}
        >
          <ButtonText>Go Back</ButtonText>
        </Button>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <Header />

      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-4">
          <Box className="mb-4">
            <Heading className="text-xl font-bold mb-4">
              Property Information
            </Heading>

            {/* Property ID (Read-only) */}
            <FormControl className="mb-4">
              <FormControlLabel>
                <FormControlLabelText>Property ID</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1" isDisabled>
                <InputField
                  value={property.property_id.toString()}
                  editable={false}
                  className="bg-gray-100"
                />
              </Input>
            </FormControl>

            {/* Address */}
            <FormControl
              className="mb-4"
              isRequired
              isInvalid={!!errors.address}
            >
              <FormControlLabel>
                <FormControlLabelText>Address</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1">
                <InputField
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    if (errors.address && text.trim()) {
                      setErrors({ ...errors, address: undefined });
                    }
                  }}
                  placeholder="Enter street address"
                />
              </Input>
              {errors.address && (
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{errors.address}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* City */}
            <FormControl className="mb-4" isRequired isInvalid={!!errors.city}>
              <FormControlLabel>
                <FormControlLabelText>City</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1">
                <InputField
                  value={city}
                  onChangeText={(text) => {
                    setCity(text);
                    if (errors.city && text.trim()) {
                      setErrors({ ...errors, city: undefined });
                    }
                  }}
                  placeholder="Enter city"
                />
              </Input>
              {errors.city && (
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{errors.city}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* State/Province */}
            <FormControl className="mb-4">
              <FormControlLabel>
                <FormControlLabelText>State/Province</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1">
                <InputField
                  value={state}
                  onChangeText={setState}
                  placeholder="Enter state or province (if applicable)"
                />
              </Input>
            </FormControl>

            {/* ZIP/Postal Code */}
            <FormControl
              className="mb-4"
              isRequired
              isInvalid={!!errors.zipCode}
            >
              <FormControlLabel>
                <FormControlLabelText>ZIP/Postal Code</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1">
                <InputField
                  value={zipCode}
                  onChangeText={(text) => {
                    setZipCode(text);
                    if (errors.zipCode && text.trim()) {
                      setErrors({ ...errors, zipCode: undefined });
                    }
                  }}
                  placeholder="Enter ZIP or postal code"
                />
              </Input>
              {errors.zipCode && (
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{errors.zipCode}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Country */}
            <FormControl
              className="mb-4"
              isRequired
              isInvalid={!!errors.country}
            >
              <FormControlLabel>
                <FormControlLabelText>Country</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1">
                <InputField
                  value={country}
                  onChangeText={(text) => {
                    setCountry(text);
                    if (errors.country && text.trim()) {
                      setErrors({ ...errors, country: undefined });
                    }
                  }}
                  placeholder="Enter country"
                />
              </Input>
              {errors.country && (
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{errors.country}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            {/* Status */}
            <FormControl className="mb-4">
              <FormControlLabel>
                <FormControlLabelText>Property Status</FormControlLabelText>
              </FormControlLabel>
              <Select
                selectedValue={status}
                defaultValue={status}
                onValueChange={(value) => setStatus(value as PropertyStatus)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Select status" />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
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
            </FormControl>
          </Box>

          {/* Location Information */}
          <Box className="mb-6 bg-gray-50 p-4 rounded-lg">
            <Heading className="text-lg font-semibold mb-3">
              Location Coordinates
            </Heading>

            <FormControl className="mb-4">
              <HStack className="items-center space-x-2">
                <Switch value={hasLocation} onValueChange={setHasLocation} />
                <FormControlLabelText>
                  Include location coordinates
                </FormControlLabelText>
              </HStack>
            </FormControl>

            {hasLocation && (
              <>
                <FormControl className="mb-4" isInvalid={!!errors.latitude}>
                  <FormControlLabel>
                    <FormControlLabelText>Latitude</FormControlLabelText>
                  </FormControlLabel>
                  <Input className="my-1">
                    <InputField
                      value={latitude}
                      onChangeText={(text) => {
                        setLatitude(text);
                        if (errors.latitude) {
                          setErrors({ ...errors, latitude: undefined });
                        }
                      }}
                      placeholder="e.g., 51.5074"
                      keyboardType="numeric"
                    />
                  </Input>
                  {errors.latitude && (
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>
                        {errors.latitude}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                <FormControl className="mb-2" isInvalid={!!errors.longitude}>
                  <FormControlLabel>
                    <FormControlLabelText>Longitude</FormControlLabelText>
                  </FormControlLabel>
                  <Input className="my-1">
                    <InputField
                      value={longitude}
                      onChangeText={(text) => {
                        setLongitude(text);
                        if (errors.longitude) {
                          setErrors({ ...errors, longitude: undefined });
                        }
                      }}
                      placeholder="e.g., -0.1278"
                      keyboardType="numeric"
                    />
                  </Input>
                  {errors.longitude && (
                    <FormControlError>
                      <FormControlErrorIcon as={AlertCircleIcon} />
                      <FormControlErrorText>
                        {errors.longitude}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                <FormControlHelper>
                  <FormControlHelperText>
                    Enter decimal coordinates (e.g., 51.5074, -0.1278)
                  </FormControlHelperText>
                </FormControlHelper>

                <Button
                  className="bg-gray-200 py-2 rounded-md mt-2"
                  onPress={() => {
                    // In a real app, this would request location permission and use geolocation
                    Alert.alert(
                      "Info",
                      "In a real app, this would use device geolocation to set coordinates."
                    );
                  }}
                >
                  <HStack className="items-center justify-center">
                    <IconSymbol name="location" size={16} color="#4F46E5" />
                    <ButtonText className="ml-2 text-indigo-700">
                      Get Current Location
                    </ButtonText>
                  </HStack>
                </Button>
              </>
            )}
          </Box>

          {/* Action Buttons */}
          <HStack className="space-x-3 mb-8">
            <Button
              className="flex-1 bg-gray-200 py-3 rounded-md"
              onPress={() => router.back()}
            >
              <ButtonText className="text-gray-700 font-medium">
                Cancel
              </ButtonText>
            </Button>

            <Button
              className="flex-1 bg-blue-500 py-3 rounded-md"
              onPress={handleSave}
              disabled={saving}
            >
              <ButtonText className="text-white font-medium">
                {saving ? "Saving..." : "Save Changes"}
              </ButtonText>
            </Button>
          </HStack>

          {/* Delete Button */}
          <Button
            className="bg-red-50 py-3 rounded-md mb-6 border border-red-300"
            onPress={() => {
              Alert.alert(
                "Delete Property",
                "Are you sure you want to delete this property? This action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      // Simulate deletion
                      setTimeout(() => {
                        router.push("/(tabs)/(properties)");
                      }, 500);
                    },
                  },
                ]
              );
            }}
          >
            <HStack className="items-center justify-center">
              <IconSymbol name="trash" size={16} color="#EF4444" />
              <ButtonText className="ml-2 text-red-500 font-medium">
                Delete Property
              </ButtonText>
            </HStack>
          </Button>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default PropertyEditScreen;
