import React, { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import StreetViewImage from "@/components/properties/details/StreetView";
import { Spinner } from "@/components/ui/spinner";
import PropertyInformation from "@/components/properties/details/PropertyInformation";
import BackButton from "@/components/BackButton";
import { useGetProperty } from "@/hooks/properties/useGetPropertyById";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";

const PropertyDetailsScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const [streetViewError, setStreetViewError] = useState(false);

  // Use the new hook to fetch property data
  const { property, isLoading, error } = useGetProperty(propertyId || "");

  const getCloudFrontUrl = (s3Url: string): string | null => {
    if (!s3Url) return null;
    const s3Key = s3Url.split("amazonaws.com/")[1];
    if (!s3Key) return s3Url;
    return `https://d24y6hzot6c372.cloudfront.net/${s3Key}`;
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </View>
    );
  }

  if (error || !property) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>
          {error
            ? `Error: ${error.message}`
            : `Property with ID ${propertyId} not found`}
        </Text>
        <Button
          className="mt-4 px-4 py-2 bg-primary-500 rounded-md"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <ResponsiveScreenWrapper scrollable={true}>
      <View className="py-2">
        <BackButton />
      </View>

      {/* Property Image - uploaded image takes priority */}
      {property.imageUrl ? (
        <Box className="h-48 w-full px-2">
          <Image
            source={{ uri: getCloudFrontUrl(property.imageUrl) || undefined }}
            alt="Property Image"
            className="h-full w-full object-cover rounded-lg"
            onError={(error) => {
              console.log("Custom image failed to load:", error);
            }}
          />
        </Box>
      ) : property.latitude && property.longitude && !streetViewError ? (
        <Box className="h-48 w-full px-2">
          <StreetViewImage
            latitude={property.latitude}
            longitude={property.longitude}
            size={{ width: 600, height: 300 }}
            onError={() => setStreetViewError(true)}
          />
          <Badge className="absolute bottom-2 left-4 py-1 px-2 rounded">
            <Text className="text-xs">Street View</Text>
          </Badge>
        </Box>
      ) : (
        <Box className="h-48 w-full flex items-center justify-center">
          <IconSymbol name="eye.slash" size={32} color="gray" />
          <Text className="text-sm text-gray-500 mt-2">
            Preview Unavailable
          </Text>
        </Box>
      )}

      {/* Property Information */}
      <PropertyInformation property={property} />
    </ResponsiveScreenWrapper>
  );
};

export default PropertyDetailsScreen;
