import React, { useState, useMemo } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  View,
  Text,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";

import { PropertyImage, SpaceType } from "@/lib/@types/properties";
import { Image } from "expo-image";
import { useGetPropertySpaces } from "@/hooks/spaces/useGetPropertySpaces";
import { AddIcon } from "@/components/ui/icon";
import { useGetProperty } from "@/hooks/properties/useGetPropertyById";
import { Fab, FabIcon } from "@/components/ui/fab";
import EmptyPhotosState from "@/components/photos/details/emptyPhotoState";
import PhotoSearch from "@/components/photos/details/photoSearch";
import { Badge } from "@/components/ui/badge";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";

// Enhanced PropertyImage type with space type information
interface EnhancedPropertyImage extends PropertyImage {
  spaceType: string;
}

const PropertyPhotosScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { property, isLoading: propertyLoading } = useGetProperty(propertyId);
  const { propertySpaces, isLoading, error } = useGetPropertySpaces(
    propertyId,
    {},
  );

  // Extract, format, and enhance images from all spaces
  const processedImages = useMemo<EnhancedPropertyImage[]>(() => {
    return (
      propertySpaces?.flatMap((space) => {
        if (!space.images || !Array.isArray(space.images)) return [];

        return space.images.flatMap((item: any) => {
          // Handle case where images might be a nested array
          if (Array.isArray(item)) {
            return item.map((img: PropertyImage) => ({
              ...img,
              spaceType: space.type || SpaceType.Unknown,
            }));
          }
          // Handle case where image is an object with imageUrl
          if (item && typeof item === "object" && item.imageUrl) {
            return {
              ...item,
              spaceType: space.type || SpaceType.Unknown,
            };
          }
          return [];
        });
      }) || []
    );
  }, [propertySpaces]);

  // Filter images based on activeFilter
  const filteredImages = useMemo<EnhancedPropertyImage[]>(() => {
    if (activeFilter === "all") {
      return processedImages;
    }
    return processedImages.filter((img) => img.spaceType === activeFilter);
  }, [processedImages, activeFilter]);

  // Get unique space types for filters
  const spaceTypes = useMemo<string[]>(() => {
    const types = new Set(processedImages.map((img) => img.spaceType));
    return Array.from(types);
  }, [processedImages]);

  // Function to convert S3 URL to CloudFront URL
  const getCloudFrontUrl = (s3Url: string): string | null => {
    if (!s3Url) return null;

    // Extract the S3 key from the URL
    // Typical S3 URL format: https://stagely-secure-storage.s3.us-east-1.amazonaws.com/uploads/path/to/image.jpg
    const s3Key = s3Url.split("amazonaws.com/")[1];

    if (!s3Key) return s3Url; // Return original if we can't extract the key

    // Construct CloudFront URL
    return `https://d24y6hzot6c372.cloudfront.net/${s3Key}`;
  };

  const handleAddPhotos = (): void => {
    router.push({
      pathname: "/(tabs)/(properties)/(photos)/add",
      params: { propertyId },
    });
  };

  // Navigate to photo detail screen
  const handlePhotoPress = (photo: EnhancedPropertyImage): void => {
    router.push({
      pathname: "/(tabs)/(properties)/(photos)/details",
      params: {
        propertyId,
        photoId: photo.id.toString(),
        spaceId: photo.spaceId?.toString() || "",
        spaceType: photo.spaceType,
      },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <ThemedText>Error: {error.message}</ThemedText>
        <Button
          className="mt-4 px-4 py-2 bg-primary-500 rounded-md"
          onPress={() => router.back()}
        >
          <ThemedText className="text-white">Go Back</ThemedText>
        </Button>
      </View>
    );
  }

  const renderPhotoItem: ListRenderItem<EnhancedPropertyImage> = ({ item }) => {
    const imageUrl = getCloudFrontUrl(item.imageUrl);

    return (
      <Pressable
        style={{ margin: 4, width: "31%", aspectRatio: 1 }}
        onPress={() => handlePhotoPress(item)}
      >
        <View style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#e0e0e0",
              borderRadius: 10,
            }}
            contentFit="cover"
          />
          {/* Type badge */}
          <Badge className="absolute bottom-0 left-0 bg-primary-400/70 text-white text-xs py-0.5 px-1 rounded-tr">
            <Text className="text-white text-xs">{item.spaceType}</Text>
          </Badge>
        </View>
      </Pressable>
    );
  };

  // Pass spaceTypes to PhotoSearch for filtering options
  return (
    <ResponsiveScreenWrapper scrollable={false}>
      <SafeAreaView className="flex-1">
        <View className="p-2">
          <BackButton />
        </View>

        {!propertyLoading && (
          <PhotoSearch
            property={property}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            spaceTypes={["all", ...spaceTypes]} // Include "all" option and available space types
          />
        )}

        {/* Image grid */}
        {filteredImages.length > 0 ? (
          <FlatList
            data={filteredImages}
            renderItem={renderPhotoItem}
            keyExtractor={(item, index) =>
              `${item.spaceId || "image"}-${index}`
            }
            numColumns={3}
            contentContainerStyle={{ padding: 4 }}
          />
        ) : (
          <View className="flex-1 pt-5">
            <EmptyPhotosState onAddPhotos={handleAddPhotos} />
          </View>
        )}

        {/* Floating Action Button */}
        <Box className="absolute bottom-0 lg:bottom-10 right-6">
          <Fab size="lg" placement="bottom right" onPress={handleAddPhotos}>
            <FabIcon size="xl" as={AddIcon} />
          </Fab>
        </Box>
      </SafeAreaView>
    </ResponsiveScreenWrapper>
  );
};

export default PropertyPhotosScreen;
