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

// Helper function for formatting dates
const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [photo, setPhoto] = useState<PropertyImage | null>(null);
  const [space, setSpace] = useState<any | null>(null);

  // Using the existing hook from the original component
  const {
    propertySpaces,
    isLoading: spacesLoading,
    error: spacesError,
  } = useGetPropertySpaces(propertyId, {});

  // Find the photo and space from propertySpaces
  useEffect(() => {
    if (!spacesLoading && propertySpaces) {
      let foundPhoto = null;
      let foundSpace = null;

      // Find the space and photo
      for (const space of propertySpaces) {
        if (space.id.toString() === spaceId) {
          foundSpace = space;
        }

        if (space.images && Array.isArray(space.images)) {
          // Handle nested arrays or direct objects
          const images = space.images.flatMap((item: any) => {
            if (Array.isArray(item)) {
              return item;
            }
            return [item];
          });

          const matchingPhoto = images.find(
            (img: PropertyImage) =>
              img && img.id && img.id.toString() === photoId,
          );

          if (matchingPhoto) {
            foundPhoto = matchingPhoto;
            if (!foundSpace) {
              foundSpace = space;
            }
            break;
          }
        }
      }

      setPhoto(foundPhoto);
      setSpace(foundSpace);
      setIsLoading(false);

      if (!foundPhoto) {
        setError(new Error("Photo not found"));
      }
    }
  }, [propertySpaces, spacesLoading, photoId, spaceId]);

  const handleEdit = () => {
    // router.push({
    //   pathname: "/(tabs)/(properties)/(photos)/edit",
    //   params: { propertyId, photoId },
    // });
    console.log("Edit button pushed");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Call delete API here
            // Then navigate back
            router.back();
          },
        },
      ],
    );
  };

  if (isLoading || spacesLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </View>
    );
  }

  if (error || spacesError) {
    return (
      <View className="flex-1 justify-center items-center">
        <ThemedText>Error: {(error || spacesError)?.message}</ThemedText>
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
      <View className="flex-row justify-between items-center p-2">
        <BackButton />
        <View className="flex-row  gap-2">
          <Button onPress={handleEdit}>
            <Text className="text-white">Edit</Text>
          </Button>
          <Button onPress={handleDelete} variant="outline">
            <ThemedText>Delete</ThemedText>
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Photo display */}
        <Box className="w-full aspect-square">
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#e0e0e0",
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
        <Card className="m-4 p-4 rounded-lg">
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
              <ThemedText>{photo.caption}</ThemedText>
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

        {/* Metadata */}
        {photo?.metadata && (
          <Card className="m-4 p-4 rounded-lg">
            <ThemedText className="text-xl font-bold mb-2">
              Image Metadata
            </ThemedText>
            <Divider className="mb-4" />

            {Object.entries(photo.metadata).map(([key, value]) => (
              <View key={key} className="flex-row justify-between mb-2">
                <ThemedText className="font-semibold">{key}:</ThemedText>
                <ThemedText>
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </ThemedText>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PhotoDetailScreen;
