import React, { useState, useMemo } from "react";
import { FlatList, Pressable, SafeAreaView, View } from "react-native";
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

const getSpaceLabel = (spaceType: SpaceType): string => {
  // Convert enum value from "LivingRoom" to "Living Room"
  return spaceType.replace(/([A-Z])/g, " $1").trim();
};

const PropertyPhotosScreen = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const [activeFilter, setActiveFilter] = useState("all");
  const { property, isLoading: propertyLoading } = useGetProperty(propertyId);
  // Define query parameters based on filter selection
  const queryParams = useMemo(() => {
    switch (activeFilter) {
      case "recent":
        return {
          sortBy: "createdAt" as const,
          sortOrder: "desc" as const,
        };
      case "spaces":
        // No specific params for spaces view, will be handled in UI
        return {};
      default:
        // "all" filter
        return {};
    }
  }, [activeFilter]);

  const { propertySpaces, isLoading, error } = useGetPropertySpaces(
    propertyId,
    queryParams,
  );

  console.log("SPACES", propertySpaces);

  const handleAddPhotos = () => {
    router.push({
      pathname: "/(tabs)/(properties)/(photos)/add",
      params: { propertyId },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
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

  // Extract all images from all spaces
  const allImages: PropertyImage[] = [];
  if (propertySpaces) {
    propertySpaces.forEach((space) => {
      if (space.images && space.images.length > 0) {
        allImages.push(...space.images);
      }
    });
  }

  const renderPhotoItem = (
    { item }: { item: PropertyImage }, //maybe use a card component!!!
  ) => (
    <Pressable
      onPress={
        //() =>
        // router.push({
        //   pathname: "/properties/[propertyId]/photos/[photoId]",
        //   params: { propertyId, photoId: item.id.toString() },
        // })
        () => console.log("PRESSED")
      }
      className="relative"
    >
      <Box className="m-1 rounded-lg overflow-hidden aspect-square">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-full"
          contentFit="cover"
          transition={200}
        />
        {item.space && (
          <Box className="absolute bottom-2 left-2 bg-black/50 rounded-md px-2 py-1">
            <ThemedText className="text-xs text-white">
              {getSpaceLabel(item.space.type)}
            </ThemedText>
          </Box>
        )}
      </Box>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1">
      <View className="py-2">
        <BackButton />
      </View>
      {!propertyLoading && (
        <PhotoSearch
          property={property}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      )}

      {/* Photo Grid */}
      {allImages.length > 0 ? (
        <FlatList
          data={allImages}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          contentContainerStyle={{ padding: 4 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyPhotosState onAddPhotos={handleAddPhotos} />
      )}

      {/* Floating Action Button */}
      <Box className="absolute bottom-6 right-6">
        <Fab size="lg" placement="bottom right" onPress={handleAddPhotos}>
          <FabIcon size="xl" as={AddIcon} />
        </Fab>
      </Box>
    </SafeAreaView>
  );
};

export default PropertyPhotosScreen;
