import React, { useState, useMemo } from "react";
import { FlatList, Pressable, SafeAreaView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";

import { IncidentImage } from "@/lib/@types/properties";
import { Image } from "expo-image";
import { useGetIncidentById } from "@/hooks/incidents/useGetIncidentsById";
import { AddIcon } from "@/components/ui/icon";
import { Fab, FabIcon } from "@/components/ui/fab";
//import EmptyPhotosState from "@/components/photos/details/emptyPhotoState";
//import PhotoSearch from "@/components/photos/details/photoSearch";

const IncidentPhotosScreen = () => {
  const params = useLocalSearchParams();
  const incidentId = params.incidentId as string;
  //const [activeFilter, setActiveFilter] = useState("all");

  const { incident, isLoading, error } = useGetIncidentById(incidentId, {
    enabled: !!incidentId,
  });

  const handleAddPhotos = () => {
    router.push({
      pathname: "/(tabs)/(incidents)/(photos)/add",
      params: { incidentId },
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

  // Extract all images from the incident
  const allImages: IncidentImage[] = incident?.images || [];

  const renderPhotoItem = ({ item }: { item: IncidentImage }) => (
    <Pressable onPress={() => console.log("PRESSED")} className="relative">
      <Box className="m-1 rounded-lg overflow-hidden aspect-square">
        <Image
          source={{ uri: item.imageUrl }}
          className="w-full h-full"
          contentFit="cover"
          transition={200}
        />
        {item.caption && (
          <Box className="absolute bottom-2 left-2 bg-black/50 rounded-md px-2 py-1">
            <ThemedText className="text-xs text-white">
              {item.caption}
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

      {!isLoading && incident && (
        /* <PhotoSearch
          incident={incident}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        /> */
        <View></View>
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
        /* <EmptyPhotosState onAddPhotos={handleAddPhotos} /> */
        <View className="flex-1 justify-center items-center">
          <ThemedText className="text-lg mb-2">No photos yet</ThemedText>
          <ThemedText className="text-gray-500 mb-4 text-center px-8">
            Add photos to document this incident
          </ThemedText>
          <Button onPress={handleAddPhotos}>
            <ThemedText className="text-white">Add Photos</ThemedText>
          </Button>
        </View>
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

export default IncidentPhotosScreen;
