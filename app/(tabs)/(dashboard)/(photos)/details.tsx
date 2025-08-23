import React, { useEffect, useState } from "react";
import { View, ScrollView, SafeAreaView, Alert, Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { PropertyImage, SpaceType } from "@/lib/@types/properties";
import { useGetPropertySpaces } from "@/hooks/spaces/useGetPropertySpaces";
import { useDeletePropertySpace } from "@/hooks/spaces/useDeleteProperySpace";

// Helper function for formatting dates
const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

// Helper function to get confidence color based on score
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return "text-green-600";
  if (confidence >= 0.6) return "text-yellow-600";
  return "text-red-600";
};

// Function to convert S3 URL to CloudFront URL
export const getCloudFrontUrl = (s3Url: string): string | null => {
  if (!s3Url) return null;

  // Extract the S3 key from the URL
  const s3Key = s3Url.split("amazonaws.com/")[1];

  if (!s3Key) return s3Url; // Return original if we can't extract the key

  // Construct CloudFront URL
  return `https://d24y6hzot6c372.cloudfront.net/${s3Key}`;
};

const PhotoDetailScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const photoId = params.photoId as string;
  const spaceId = params.spaceId as string;
  const spaceType = params.spaceType as string;

  const [error, setError] = useState<Error | null>(null);
  const [photo, setPhoto] = useState<PropertyImage | null>(null);
  const [space, setSpace] = useState<any | null>(null);

  // Using the existing hook from the original component
  const {
    propertySpaces,
    isLoading: spacesLoading,
    error: spacesError,
  } = useGetPropertySpaces(propertyId, {});

  // Use the delete hook
  const {
    deletePropertySpace,
    isDeleting,
    deleteError,
    deleteSuccess,
    reset: resetDeleteState,
  } = useDeletePropertySpace();

  // Find the photo and space from propertySpaces
  useEffect(() => {
    // Don't process while loading
    if (spacesLoading) {
      setError(null); // Clear error while loading
      return;
    }

    // Handle API error
    if (spacesError) {
      setError(spacesError);
      return;
    }

    // Don't show errors if deletion is in progress or successful
    // This prevents "Photo not found" errors when the space is being deleted
    if (isDeleting || deleteSuccess) {
      return;
    }

    // No data
    if (!propertySpaces || propertySpaces.length === 0) {
      setError(new Error("No spaces found for this property"));
      return;
    }

    // Search for the photo and space
    let foundPhoto = null;
    let foundSpace = null;

    // First, find the space by ID
    foundSpace = propertySpaces.find(
      (space) => space.id.toString() === spaceId,
    );

    // Then search for the photo across all spaces
    for (const space of propertySpaces) {
      if (space.images && Array.isArray(space.images)) {
        // Flatten the images array (handle nested arrays)
        const images = space.images.flatMap((item: any) =>
          Array.isArray(item) ? item : [item],
        );

        const matchingPhoto = images.find(
          (img: PropertyImage) =>
            img && img.id && img.id.toString() === photoId,
        );

        if (matchingPhoto) {
          foundPhoto = matchingPhoto;
          // If we haven't found the space by ID, use the space that contains the photo
          if (!foundSpace) {
            foundSpace = space;
          }
          break;
        }
      }
    }

    // Set results
    setPhoto(foundPhoto);
    setSpace(foundSpace);

    // Set error only if not found and not during deletion
    if (!foundPhoto) {
      setError(new Error("Photo not found"));
    } else {
      setError(null);
    }
  }, [
    propertySpaces,
    spacesLoading,
    spacesError,
    photoId,
    spaceId,
    isDeleting,
    deleteSuccess,
  ]);

  // Handle successful deletion
  useEffect(() => {
    if (deleteSuccess) {
      Alert.alert("Success", "Space deleted successfully!", [
        {
          text: "OK",
          onPress: () => {
            resetDeleteState();
            router.back();
          },
        },
      ]);
    }
  }, [deleteSuccess, resetDeleteState]);

  // Handle deletion errors
  useEffect(() => {
    if (deleteError) {
      Alert.alert(
        "Delete Failed",
        deleteError.message || "Failed to delete space. Please try again.",
        [
          {
            text: "OK",
            onPress: () => resetDeleteState(),
          },
        ],
      );
    }
  }, [deleteError, resetDeleteState]);

  const handleEdit = () => {
    // router.push({
    //   pathname: "/(tabs)/(properties)/(photos)/edit",
    //   params: { propertyId, photoId },
    // });
    console.log("Edit button pushed");
  };

  const handleDelete = () => {
    if (!space) {
      Alert.alert("Error", "Space information not available");
      return;
    }

    const spaceName = space.name || "Unnamed Space";
    const photoCount = space.images?.length || 0;

    Alert.alert(
      "Delete Space",
      `Are you sure you want to delete "${spaceName}"? This will permanently delete the space and all ${photoCount} photo(s) in it. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePropertySpace(spaceId);
          },
        },
      ],
    );
  };

  // Show loading spinner during initial load or deletion
  if (spacesLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Spinner size="large" />
        <ThemedText className="mt-4">Loading photo details...</ThemedText>
      </View>
    );
  }

  if (error || spacesError) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <ThemedText className="text-red-500 text-center mb-4">
          Error: {(error || spacesError)?.message}
        </ThemedText>
        <Button
          className="mt-4 px-4 py-2 bg-primary-500 rounded-md"
          onPress={() => router.back()}
        >
          <ThemedText className="text-white">Go Back</ThemedText>
        </Button>
      </View>
    );
  }

  const imageUrl = photo?.imageUrl ? getCloudFrontUrl(photo.imageUrl) : null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header with loading overlay during deletion */}
      <View className="relative">
        <View className="flex-row justify-between items-center p-2">
          <BackButton />
          <View className="flex-row gap-2">
            <Button onPress={handleEdit} disabled={isDeleting}>
              <Text className="text-white">Edit</Text>
            </Button>
            <Button
              onPress={handleDelete}
              variant="outline"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <View className="flex-row items-center">
                  <Spinner size="small" className="mr-2" />
                  <ThemedText>Deleting...</ThemedText>
                </View>
              ) : (
                <ThemedText>Delete</ThemedText>
              )}
            </Button>
          </View>
        </View>

        {/* Loading overlay during deletion */}
        {isDeleting && (
          <View className="absolute inset-0 bg-black/20 flex justify-center items-center">
            <View className="bg-white p-4 rounded-lg flex-row items-center">
              <Spinner size="small" className="mr-3" />
              <ThemedText>Deleting space...</ThemedText>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1"
        scrollEnabled={!isDeleting}
        pointerEvents={isDeleting ? "none" : "auto"}
      >
        {/* Photo display */}
        <Box className="w-full aspect-square">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#e0e0e0",
                opacity: isDeleting ? 0.5 : 1,
              }}
              contentFit="contain"
            />
          ) : (
            <View className="flex-1 justify-center items-center bg-gray-200">
              <ThemedText>No image available</ThemedText>
            </View>
          )}
        </Box>

        {/* Photo details */}
        <Card
          className="m-4 p-4 rounded-lg"
          style={{ opacity: isDeleting ? 0.5 : 1 }}
        >
          <ThemedText className="text-xl font-bold mb-2">
            Photo Details
          </ThemedText>
          <Divider className="mb-4" />

          <View className="flex-row justify-between mb-2">
            <ThemedText className="font-semibold">Space Type:</ThemedText>
            <ThemedText>{spaceType || SpaceType.Unknown}</ThemedText>
          </View>

          {space && space.name && (
            <View className="flex-row justify-between mb-2">
              <ThemedText className="font-semibold">Space Name:</ThemedText>
              <ThemedText>{space.name || "Unnamed Space"}</ThemedText>
            </View>
          )}

          {photo?.caption && (
            <View className="flex-row justify-between mb-2">
              <ThemedText className="font-semibold">Caption:</ThemedText>
              <ThemedText className="flex-1 text-right ml-2">
                {photo.caption}
              </ThemedText>
            </View>
          )}

          {photo?.takenAt && (
            <View className="flex-row justify-between mb-2">
              <ThemedText className="font-semibold">Date Taken:</ThemedText>
              <ThemedText>{formatDate(photo.takenAt)}</ThemedText>
            </View>
          )}

          <View className="flex-row justify-between mb-2">
            <ThemedText className="font-semibold">Created At:</ThemedText>
            <ThemedText>{photo ? formatDate(photo.createdAt) : "-"}</ThemedText>
          </View>

          <View className="flex-row justify-between mb-2">
            <ThemedText className="font-semibold">Last Updated:</ThemedText>
            <ThemedText>{photo ? formatDate(photo.updatedAt) : "-"}</ThemedText>
          </View>
        </Card>

        {/* Object Labels - Space Level */}
        {space?.objectLabels && space.objectLabels.length > 0 && (
          <Card
            className="m-4 p-4 rounded-lg"
            style={{ opacity: isDeleting ? 0.5 : 1 }}
          >
            <ThemedText className="text-xl font-bold mb-2">
              Detected Objects in Space ({space.objectLabels.length})
            </ThemedText>
            <Divider className="mb-4" />

            {space.objectLabels.map((label: any) => (
              <View
                key={label.id}
                className="flex-row justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
              >
                <View className="flex-1">
                  <ThemedText className="font-semibold text-base">
                    {label.name}
                  </ThemedText>
                  {label.category && (
                    <ThemedText className="text-sm text-gray-600">
                      Category: {label.category}
                    </ThemedText>
                  )}
                </View>
                <View className="items-end">
                  <ThemedText
                    className={`font-bold ${getConfidenceColor(label.confidence)}`}
                  >
                    {Math.round(label.confidence * 100)}%
                  </ThemedText>
                  <ThemedText className="text-xs text-gray-500">
                    confidence
                  </ThemedText>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PhotoDetailScreen;
