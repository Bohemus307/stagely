import React, { useEffect, useState } from "react";
import { ScrollView, SafeAreaView, Text, Pressable, FlatList, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@/components/ui/modal";
import { CloseIcon, Icon } from "@/components/ui/icon";
import { Property } from "@/components/properties/list";
import { properties } from "@/components/properties/data/properties";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";

// Type definitions from the existing code
interface ImageData {
  image_id: number;
  image_url: string;
  caption: string;
  taken_at: string;
}

// Group photos by month
interface GroupedPhotos {
  month: string;
  photos: ImageData[];
}

const PropertyPhotosScreen = () => {
  const { propertyId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [allPhotos, setAllPhotos] = useState<ImageData[]>([]);
  const [groupedPhotos, setGroupedPhotos] = useState<GroupedPhotos[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<ImageData | null>(null);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);

  useEffect(() => {
    // Find the property by ID
    const id = parseInt(propertyId as string);
    const foundProperty = properties.find((p) => p.property_id === id);

    if (foundProperty) {
      setProperty(foundProperty);

      // Collect all photos from property and incidents
      const photos: ImageData[] = [];

      // Add property images if any
      if (foundProperty.images && foundProperty.images.length > 0) {
        foundProperty.images.forEach((img) => {
          if (img.image_url && img.caption && img.taken_at) {
            photos.push({
              image_id: img.image_id,
              image_url: img.image_url,
              caption: img.caption,
              taken_at: img.taken_at,
            });
          }
        });
      }

      // Add incident images if any
      if (foundProperty.incidents && foundProperty.incidents.length > 0) {
        foundProperty.incidents.forEach((incident) => {
          if (incident.images && incident.images.length > 0) {
            incident.images.forEach((img) => {
              if (img.image_url && img.caption && img.taken_at) {
                photos.push({
                  image_id: img.image_id,
                  image_url: img.image_url,
                  caption: img.caption,
                  taken_at: img.taken_at,
                });
              }
            });
          }
        });
      }

      // Sort by date (newest first)
      photos.sort((a, b) => {
        return new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime();
      });

      setAllPhotos(photos);

      // Group photos by month
      const grouped = groupPhotosByMonth(photos);
      setGroupedPhotos(grouped);

      setLoading(false);
    } else {
      // Property not found
      setLoading(false);
    }
  }, [propertyId]);

  // Function to group photos by month
  const groupPhotosByMonth = (photos: ImageData[]): GroupedPhotos[] => {
    const grouped: { [key: string]: ImageData[] } = {};

    photos.forEach((photo) => {
      const date = new Date(photo.taken_at);
      const monthYear = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(photo);
    });

    // Convert to array and sort by date (newest first)
    return Object.keys(grouped)
      .map((month) => ({
        month,
        photos: grouped[month],
      }))
      .sort((a, b) => {
        const dateA = new Date(a.photos[0].taken_at);
        const dateB = new Date(b.photos[0].taken_at);
        return dateB.getTime() - dateA.getTime();
      });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewPhoto = (photo: ImageData) => {
    setSelectedPhoto(photo);
    setIsPhotoModalVisible(true);
  };

  // Render individual photo thumbnail
  const renderPhotoThumbnail = ({ item }: { item: ImageData }) => (
    <Pressable
      className="relative bg-gray-100 rounded-md overflow-hidden m-1"
      style={{ width: 120, height: 120 }}
      onPress={() => handleViewPhoto(item)}
    >
      <Image
        source={{ uri: item.image_url }}
        alt={item.caption}
        className="w-full h-full"
      />
    </Pressable>
  );

  // Render a group of photos by month
  const renderPhotoGroup = ({ item }: { item: GroupedPhotos }) => (
    <VStack className="mb-6">
      <HStack className="items-center justify-between mb-2">
        <Text className="text-gray-500 text-sm">
          {item.photos.length} photos
        </Text>
      </HStack>

      <FlatList
        data={item.photos}
        renderItem={renderPhotoThumbnail}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(photo) => photo.image_id.toString()}
        contentContainerClassName="pb-2"
      />
    </VStack>
  );

  // Render loading state
  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <Text>Loading photos...</Text>
      </ThemedView>
    );
  }

  // Property not found
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

  const handleBack = () => {
      router.back();
    };

  return (
    <ThemedView className="flex-1">
      <TouchableOpacity
        onPress={handleBack}
        className="flex flex-row px-1 py-2"
      >
        <Ionicons name="chevron-back" size={24} color="#042C44" />
        <ThemedText>Back</ThemedText>
      </TouchableOpacity>
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 p-4">
          {/* Search Bar */}
          <Input className="mb-4 bg-white rounded-lg shadow-sm">
            <IconSymbol name="house" size={20} color="#6B7280" />
            <InputField placeholder="Search photos" className="pl-2" />
          </Input>

          {/* No photos message */}
          {allPhotos.length === 0 && (
            <VStack className="flex-1 items-center justify-center py-16">
              <Icon size="xl" color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 text-center">
                No photos available for this property.
              </Text>
            </VStack>
          )}

          {/* Photos Grid by Month */}
          {allPhotos.length > 0 && (
            <VStack className="mb-6">
              {/* Photo count */}
              <Text className="text-gray-500 mb-4">
                {allPhotos.length} photos total
              </Text>

              {/* Photos grouped by month */}
              <FlatList
                data={groupedPhotos}
                renderItem={renderPhotoGroup}
                keyExtractor={(group) => group.month}
                scrollEnabled={false}
              />
            </VStack>
          )}
        </ScrollView>

        {/* Photo Viewer Modal */}
        {selectedPhoto && (
          <Modal
            isOpen={isPhotoModalVisible}
            onClose={() => setIsPhotoModalVisible(false)}
            size="md"
          >
            <ModalBackdrop />
            <ModalContent>
              <ModalHeader>
                <Heading size="md">{selectedPhoto.caption}</Heading>
                <ModalCloseButton>
                  <Icon as={CloseIcon} size="md" />
                </ModalCloseButton>
              </ModalHeader>
              <ModalBody>
                <VStack>
                  <Box className="w-full mb-4" style={{ aspectRatio: 4 / 3 }}>
                    <Image
                      source={{ uri: selectedPhoto.image_url }}
                      alt={selectedPhoto.caption}
                      className="w-full h-full rounded-md"
                    />
                  </Box>

                  <VStack className="mb-4">
                    <HStack className="justify-between mb-3">
                      <Text className="text-gray-500">Date Taken</Text>
                      <Text className="text-gray-800 font-medium">
                        {formatDate(selectedPhoto.taken_at)}
                      </Text>
                    </HStack>

                    <HStack className="justify-between">
                      <Text className="text-gray-500">Photo ID</Text>
                      <Text className="text-gray-800 font-medium">
                        {selectedPhoto.image_id}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </SafeAreaView>
    </ThemedView>
  );
};

export default PropertyPhotosScreen;
