import React, { useState, useEffect } from "react";
import { Animated, Dimensions, ScrollView, Alert } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { Button, ButtonText } from "@/components/ui/button";
import RoomDetectionHeader from "./RoomDetectionHeader";
import RoomTypeSelector, { RoomType } from "./RoomTypeSelector";
import ConfidenceMeter from "./ConfidenceMeter";
import DetectedObjectsList from "./DetectedObjectsList";
import { SpaceType } from "@/lib/@types/properties";
import { useUpdatePropertySpace } from "@/hooks/spaces/useUpdatePropertySpace";

interface ObjectLabel {
  name: string;
  confidence: string;
  category?: string;
}

interface RoomDetectionCardProps {
  spaceId: string;
  imageUri: string;
  detectedRoom: string;
  confidence: number;
  objectLabels?: ObjectLabel[];
  onConfirm: (updatedSpace?: any) => void;
  onCancel: () => void;
}

const ROOM_TYPES: RoomType[] = [
  { id: "living_room", name: "Living Room", icon: "sofa.fill" },
  { id: "bedroom", name: "Bedroom", icon: "bed.double.fill" },
  { id: "kitchen", name: "Kitchen", icon: "refrigerator.fill" },
  { id: "bathroom", name: "Bathroom", icon: "shower.fill" },
  { id: "dining_room", name: "Dining Room", icon: "table.furniture.fill" },
  { id: "office", name: "Office", icon: "desktopcomputer" },
  { id: "garage", name: "Garage", icon: "car.fill" },
  { id: "exterior", name: "Exterior", icon: "house.fill" },
  { id: "basement", name: "Basement", icon: "stairs" },
  { id: "hallway", name: "Hallway", icon: "shoe.fill" },
  { id: "other", name: "Other", icon: "questionmark.circle.fill" },
];

const RoomDetectionCard: React.FC<RoomDetectionCardProps> = ({
  spaceId,
  imageUri,
  detectedRoom,
  confidence,
  objectLabels = [],
  onConfirm,
  onCancel,
}) => {
  const [selectedRoom, setSelectedRoom] = useState(detectedRoom);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [confidenceAnim] = useState(new Animated.Value(0));
  const [updatedLabels, setUpdatedLabels] =
    useState<ObjectLabel[]>(objectLabels);

  const windowWidth = Dimensions.get("window").width;
  const imageHeight = (windowWidth - 32) * 0.6;

  // Use the update hook
  const {
    updatePropertySpace,
    isLoading: isUpdating,
    error: updateError,
    isSuccess,
    data: updatedSpace,
    reset,
  } = useUpdatePropertySpace();

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(confidenceAnim, {
        toValue: confidence,
        duration: 1200,
        delay: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [confidence, confidenceAnim, fadeAnim, scaleAnim]);

  // Handle successful update
  useEffect(() => {
    if (isSuccess && updatedSpace) {
      onConfirm(updatedSpace);
      reset(); // Reset mutation state for next use
    }
  }, [isSuccess, updatedSpace, onConfirm, reset]);

  // Handle update errors
  useEffect(() => {
    if (updateError) {
      Alert.alert(
        "Update Failed",
        updateError.message || "Failed to update room type. Please try again.",
        [
          {
            text: "OK",
            onPress: () => reset(), // Reset error state
          },
        ],
      );
    }
  }, [updateError, reset]);

  const formatRoomName = (room: string) => {
    return room
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleLabelsUpdate = (labels: ObjectLabel[]) => {
    setUpdatedLabels(labels);
  };

  // Convert room type string to SpaceType enum
  const mapRoomTypeToSpaceType = (roomType: string): SpaceType => {
    const mapping: Record<string, SpaceType> = {
      living_room: SpaceType.LivingRoom,
      bedroom: SpaceType.Bedroom,
      kitchen: SpaceType.Kitchen,
      bathroom: SpaceType.Bathroom,
      dining_room: SpaceType.Other,
      office: SpaceType.Other,
      garage: SpaceType.Garage,
      exterior: SpaceType.Exterior,
      basement: SpaceType.Other,
      other: SpaceType.Other,
    };

    return mapping[roomType] || SpaceType.Other;
  };

  const handleConfirm = () => {
    // Prepare update data
    const updateData: any = {
      type: mapRoomTypeToSpaceType(selectedRoom),
    };

    // Include objectLabels directly if they've been modified
    if (
      updatedLabels.length !== objectLabels.length ||
      JSON.stringify(updatedLabels) !== JSON.stringify(objectLabels)
    ) {
      // Convert and validate data for the backend
      updateData.objectLabels = updatedLabels.map((label) => {
        let confidence =
          typeof label.confidence === "string"
            ? parseFloat(label.confidence)
            : label.confidence;

        // Convert from 0-100 scale to 0-1 scale if needed
        if (confidence > 1) {
          confidence = confidence / 100;
        }

        // Ensure confidence is within valid range (0-1)
        confidence = Math.min(Math.max(confidence, 0), 1);

        return {
          name: label.name,
          confidence: confidence,
          category: label.category === undefined ? null : label.category,
        };
      });
    }

    console.log("Updating space with data:", updateData);

    // Call the mutation
    updatePropertySpace({
      spaceId,
      data: updateData,
    });
  };

  const isDisabled = isUpdating;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
      className="flex-1 bg-white"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        className="flex-1"
        scrollEnabled={!isUpdating} // Disable scrolling during update
      >
        {/* Image Section with Overlay */}
        <RoomDetectionHeader
          imageUri={imageUri}
          imageHeight={imageHeight}
          confidence={confidence}
        />

        {/* Content Section */}
        <Box className="px-4 py-6 bg-white rounded-t-3xl -mt-4">
          {/* Title Section */}
          <Box className="mb-6">
            <ThemedText className="text-3xl font-bold mb-2">
              Is this the {formatRoomName(detectedRoom)}?
            </ThemedText>
            <ThemedText className="text-gray-600">
              We think we've identified this room. Confirm or select the correct
              type below.
            </ThemedText>
          </Box>

          {/* Detected Objects with Add Labels functionality */}
          <DetectedObjectsList
            objectLabels={objectLabels}
            confidence={confidence}
            roomType={selectedRoom}
            onLabelsUpdate={handleLabelsUpdate}
          />

          {/* Room Type Selection Grid */}
          <RoomTypeSelector
            roomTypes={ROOM_TYPES}
            selectedRoom={selectedRoom}
            detectedRoom={detectedRoom}
            onSelectRoom={setSelectedRoom}
          />

          {/* Confidence Meter */}
          <ConfidenceMeter
            confidence={confidence}
            confidenceAnim={confidenceAnim}
          />

          {/* Action Buttons */}
          <Box className="flex-row gap-3">
            <Button
              variant="outline"
              action="secondary"
              onPress={onCancel}
              className="flex-1 border-gray-300"
              disabled={isDisabled}
            >
              <ThemedText className="text-gray-700">Cancel</ThemedText>
            </Button>
            <Button
              variant="solid"
              action="primary"
              onPress={handleConfirm}
              className="flex-1 bg-primary-500"
              disabled={isDisabled}
            >
              <ButtonText className="text-white">
                {isUpdating ? "Updating..." : "Confirm"}
              </ButtonText>
            </Button>
          </Box>
        </Box>
      </ScrollView>
    </Animated.View>
  );
};

export default RoomDetectionCard;
