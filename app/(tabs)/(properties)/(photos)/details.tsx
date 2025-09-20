import React, { useEffect, useState } from "react";
import { View, ScrollView, SafeAreaView, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { PropertyImage, SpaceType } from "@/lib/@types/properties";

import { useDeletePropertySpace } from "@/hooks/spaces/useDeleteProperySpace";
import { ObjectLabel } from "@/hooks/spaces/useUpdatePropertySpace";
import { useGetPropertySpace } from "@/hooks/spaces/useGetSpaceById";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";

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
  const photoId = params.photoId as string;
  const spaceId = params.spaceId as string;
  const spaceType = params.spaceType as string;

  const [photo, setPhoto] = useState<PropertyImage | null>(null);

  // Use the new hook to get the specific space
  const {
    propertySpace: space,
    isLoading: spaceLoading,
    error: spaceError,
  } = useGetPropertySpace(spaceId);

  // Use the delete hook
  const {
    deletePropertySpace,
    isDeleting,
    deleteError,
    deleteSuccess,
    reset: resetDeleteState,
  } = useDeletePropertySpace();

  // Find the photo within the space
  useEffect(() => {
    if (!space || !space.images || isDeleting || deleteSuccess) {
      return;
    }

    // Flatten the images array (handle nested arrays)
    const images = space.images.flatMap((item: PropertyImage) =>
      Array.isArray(item) ? item : [item],
    );

    // Find the specific photo by ID
    const matchingPhoto = images.find(
      (img: PropertyImage) => img && img.id && img.id.toString() === photoId,
    );

    setPhoto(matchingPhoto || null);
  }, [space, photoId, isDeleting, deleteSuccess]);

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

  // Show error state
  if (spaceError) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <ThemedText className="text-red-500 text-center mb-4">
          Error: {spaceError.message}
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

  // Show not found state if photo is not found after space loads
  if (!spaceLoading && space && !photo) {
    return (
      <View className="flex-1 justify-center items-center bg-background px-4">
        <ThemedText className="text-red-500 text-center mb-4">
          Photo not found in this space
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
    <ResponsiveScreenWrapper scrollable={false}>
      <SafeAreaView className="flex-1">
        {/* Header with loading overlay during deletion */}
        <View className="relative">
          <View className="flex-row justify-between items-center p-2">
            <BackButton />
            <View className="flex-row gap-2">
              <Button
                variant="solid"
                onPress={handleEdit}
                disabled={isDeleting}
                className="bg-white"
              >
                <ButtonText className="text-primary-500">Edit</ButtonText>
              </Button>
              <Button onPress={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <View className="flex-row items-center">
                    <Spinner size="small" className="mr-2" />
                    <ButtonText className="text-white">Deleting...</ButtonText>
                  </View>
                ) : (
                  <ButtonText className="text-white">Delete</ButtonText>
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
              <View className="flex-row justify-between mb-2 w-full">
                <ThemedText className="font-semibold">Space Name:</ThemedText>
                <ThemedText className="text-right w-2/3">
                  {space.name || "Unnamed Space"}
                </ThemedText>
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
              <ThemedText>
                {photo ? formatDate(photo.createdAt) : "-"}
              </ThemedText>
            </View>

            <View className="flex-row justify-between mb-2">
              <ThemedText className="font-semibold">Last Updated:</ThemedText>
              <ThemedText>
                {photo ? formatDate(photo.updatedAt) : "-"}
              </ThemedText>
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

              {space.objectLabels.map((label: ObjectLabel) => (
                <View
                  key={label.name}
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
    </ResponsiveScreenWrapper>
  );
};

export default PhotoDetailScreen;
