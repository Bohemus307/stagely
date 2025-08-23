import { SafeAreaView, Pressable, ActivityIndicator, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import BackButton from "@/components/BackButton";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Badge } from "@/components/ui/badge";
import { Colors } from "@/constants/Colors";
import { useGetProperty } from "@/hooks/properties/useGetPropertyById";

/**
 * Add Incident screen with property selection and photo options
 */
const AddIncidentScreen = () => {
  // Get the property ID from params
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;

  // If we have a propertyId, fetch its details
  const {
    property,
    isLoading: propertyLoading,
    error: propertyError,
  } = useGetProperty(propertyId);

  // Action handlers
  const handleTakePhoto = (): void => {
    // Navigate to camera screen for incident
    router.push({
      pathname: "/(tabs)/(dashboard)/camera",
      params: { propertyId },
    });
  };

  const handleSelectFromGallery = (): void => {
    router.push({
      pathname: "/(tabs)/(dashboard)/(photos)/select",
      params: { propertyId },
    });
  };

  const handleBack = (): void => {
    router.back();
  };

  // Option card style
  const getCardStyle = () => {
    return "bg-gray-200 rounded-xl overflow-hidden";
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header */}
      <Box className="px-2 py-2 border-b border-gray-200">
        <Box className="flex-row justify-between items-center">
          <BackButton />
          <ThemedText className="text-lg font-medium text-center flex-1 mr-24">
            Report New Incident
          </ThemedText>
        </Box>
      </Box>

      {propertyLoading ? (
        <Box className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <ThemedText className="mt-4">Loading property data...</ThemedText>
        </Box>
      ) : propertyError || !property ? (
        <Box className="flex-1 justify-center items-center p-6">
          <IconSymbol name="exclamationmark.triangle" size={48} color="red" />
          <ThemedText className="text-lg font-semibold mt-4 text-center">
            Error Loading Property
          </ThemedText>
          <ThemedText className="text-center mt-2">
            There was a problem loading the property information. Please try
            again.
          </ThemedText>
          <Pressable
            onPress={handleBack}
            className="mt-6 bg-primary-500 rounded-full px-6 py-2"
          >
            <ThemedText className="text-white font-semibold">
              Go Back
            </ThemedText>
          </Pressable>
        </Box>
      ) : (
        <Box className="flex-1 px-4 py-6">
          {/* Property Information */}
          <Box className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <ThemedText className="text-lg font-semibold mb-2">
              Property
            </ThemedText>

            {/* Property Details */}
            <Box className="p-3 bg-primary-50 rounded-lg">
              <HStack className="items-center">
                <IconSymbol
                  name="building.2.fill"
                  size={20}
                  color={Colors.light.tabIconDefault}
                />
                <VStack className="ml-2 flex-1">
                  <ThemedText className="font-semibold">
                    {property.address}
                  </ThemedText>
                  <ThemedText className="text-gray-600 text-sm">
                    {property.city}, {property.state} {property.zipCode}
                  </ThemedText>
                </VStack>
                <Badge
                  className={`${
                    property.status === "Active"
                      ? "bg-green-500"
                      : property.status === "Maintenance"
                        ? "bg-amber-500"
                        : "bg-gray-500"
                  }`}
                >
                  <Text className="text-white text-xs">{property.status}</Text>
                </Badge>
              </HStack>
            </Box>
          </Box>

          <ThemedText className="text-base mb-6 text-gray-600">
            Choose how you would like to document this incident:
          </ThemedText>

          {/* Option Cards */}
          <Box className="gap-4">
            {/* Take Photo Option */}
            <Pressable onPress={handleTakePhoto} className={getCardStyle()}>
              <Box className="flex-row items-center py-5 px-4">
                <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                  <IconSymbol name="camera.fill" size={24} color="white" />
                </Box>
                <Box className="flex-1">
                  <ThemedText className="text-lg font-medium">
                    Take New Photo
                  </ThemedText>
                </Box>
              </Box>
            </Pressable>

            {/* Upload from Gallery Option */}
            <Pressable
              onPress={handleSelectFromGallery}
              className={getCardStyle()}
            >
              <Box className="flex-row items-center py-5 px-4">
                <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                  <IconSymbol
                    name="photo.on.rectangle"
                    size={24}
                    color="white"
                  />
                </Box>
                <Box className="flex-1">
                  <ThemedText className="text-lg font-medium">
                    Choose from Gallery
                  </ThemedText>
                </Box>
              </Box>
            </Pressable>
          </Box>
        </Box>
      )}
    </SafeAreaView>
  );
};

export default AddIncidentScreen;
