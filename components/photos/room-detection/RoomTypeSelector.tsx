import React from "react";
import { Pressable, Text } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

export interface RoomType {
  id: string;
  name: string;
  icon: string;
}

interface RoomTypeSelectorProps {
  roomTypes: RoomType[];
  selectedRoom: string;
  detectedRoom: string;
  onSelectRoom: (roomId: string) => void;
}

const RoomTypeSelector: React.FC<RoomTypeSelectorProps> = ({
  roomTypes,
  selectedRoom,
  detectedRoom,
  onSelectRoom,
}) => {
  return (
    <Box className="mb-6">
      <ThemedText className="text-lg font-semibold mb-4">Room Type</ThemedText>
      <Box className="flex-row flex-wrap justify-between">
        {roomTypes.map((room) => {
          const isSelected = selectedRoom === room.id;
          const isDetected = detectedRoom === room.id;

          return (
            <Pressable
              key={room.id}
              onPress={() => onSelectRoom(room.id)}
              className={`w-[48%] mb-3`}
            >
              <Box
                className={`
                  p-4 rounded-xl border-2 flex-row items-center
                  ${isSelected ? "border-primary-500 bg-primary-50" : "border-gray-200 bg-white"}
                `}
              >
                <Box
                  className={`
                    w-10 h-10 rounded-full justify-center items-center mr-3
                    ${isSelected ? "bg-primary-500" : "bg-gray-100"}
                  `}
                >
                  <IconSymbol
                    name={room.icon as any}
                    size={20}
                    color={isSelected ? "white" : "#6B7280"}
                  />
                </Box>
                <Box className="flex-1">
                  <Text
                    className={`
                      text-sm font-medium
                      ${isSelected ? "text-primary-600" : "text-gray-700"}
                    `}
                  >
                    {room.name}
                  </Text>
                  {isDetected && (
                    <ThemedText className="text-xs text-gray-500">
                      AI detected
                    </ThemedText>
                  )}
                </Box>
                {isSelected && (
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={20}
                    color="#3B82F6"
                  />
                )}
              </Box>
            </Pressable>
          );
        })}
      </Box>
    </Box>
  );
};

export default RoomTypeSelector;
