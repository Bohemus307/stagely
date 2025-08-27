import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";

interface AddObjectLabelsModalProps {
  visible: boolean;
  currentLabels: { name: string; confidence: string }[];
  roomType: string;
  onClose: () => void;
  onSave: (labels: { name: string; confidence: string }[]) => void;
}

const SUGGESTED_OBJECTS: { [key: string]: string[] } = {
  "Living Room": [
    "Sofa",
    "TV",
    "Coffee Table",
    "Lamp",
    "Rug",
    "Curtains",
    "Bookshelf",
    "Fireplace",
  ],
  Bedroom: [
    "Bed",
    "Nightstand",
    "Dresser",
    "Mirror",
    "Closet",
    "Lamp",
    "Curtains",
    "Chair",
  ],
  Kitchen: [
    "Refrigerator",
    "Stove",
    "Microwave",
    "Sink",
    "Cabinets",
    "Table",
    "Chairs",
    "Dishwasher",
  ],
  Bathroom: [
    "Toilet",
    "Sink",
    "Shower",
    "Bathtub",
    "Mirror",
    "Towels",
    "Cabinet",
    "Tiles",
  ],
  "Dining Room": [
    "Table",
    "Chairs",
    "Chandelier",
    "Cabinet",
    "Rug",
    "Curtains",
    "Artwork",
    "Sideboard",
  ],
  Office: [
    "Desk",
    "Chair",
    "Computer",
    "Bookshelf",
    "Lamp",
    "Filing Cabinet",
    "Printer",
    "Whiteboard",
  ],
  Garage: [
    "Car",
    "Workbench",
    "Tool Cabinet",
    "Shelving",
    "Bike",
    "Lawn Mower",
    "Ladder",
    "Storage Boxes",
  ],
  Basement: [
    "Furnace",
    "Water Heater",
    "Washer",
    "Dryer",
    "Storage",
    "Workbench",
    "Shelving",
    "Stairs",
  ],
  Exterior: [
    "Driveway",
    "Garage Door",
    "Front Door",
    "Windows",
    "Roof",
    "Chimney",
    "Gutters",
    "Siding",
    "Deck",
    "Patio",
    "Porch",
    "Balcony",
    "Fence",
    "Gate",
    "Walkway",
    "Steps",
    "Lawn",
    "Garden",
    "Trees",
    "Bushes",
    "Flowers",
    "Landscaping",
    "Mulch",
    "Rocks",
    "Pool",
    "Hot Tub",
    "Fire Pit",
    "BBQ Grill",
    "Outdoor Kitchen",
    "Pergola",
    "Gazebo",
    "Shed",
    "Mailbox",
    "Lamp Post",
    "Outdoor Lighting",
    "Security Camera",
    "Doorbell",
    "House Numbers",
    "Outdoor Furniture",
    "Umbrella",
    "Swing",
    "Hammock",
    "Planter",
    "Fountain",
    "Statue",
    "Flagpole",
  ],
  Other: [
    "Window",
    "Door",
    "Wall Art",
    "Plant",
    "Ceiling Fan",
    "Shelves",
    "Storage",
    "Decorations",
  ],
};

const AddObjectLabelsModal: React.FC<AddObjectLabelsModalProps> = ({
  visible,
  currentLabels,
  roomType,
  onClose,
  onSave,
}) => {
  const [customLabel, setCustomLabel] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(
    new Set(currentLabels.map((label) => label.name)),
  );

  const handleAddCustomLabel = () => {
    if (customLabel.trim()) {
      setSelectedLabels(new Set([...selectedLabels, customLabel.trim()]));
      setCustomLabel("");
    }
  };

  const toggleLabel = (label: string) => {
    const newLabels = new Set(selectedLabels);
    if (newLabels.has(label)) {
      newLabels.delete(label);
    } else {
      newLabels.add(label);
    }
    setSelectedLabels(newLabels);
  };

  const handleSave = () => {
    const labelsArray = Array.from(selectedLabels).map((name) => ({
      name,
      confidence: "100", // Manual labels have 100% confidence
    }));
    onSave(labelsArray);
    onClose();
  };

  // Get room-specific suggestions based on the room type
  const getRoomSpecificSuggestions = () => {
    // Convert room type from snake_case to proper format
    const formattedRoomType = roomType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const roomSuggestions = SUGGESTED_OBJECTS[formattedRoomType] || [];
    const generalSuggestions = SUGGESTED_OBJECTS["Other"] || [];

    // Combine room-specific and general suggestions, remove duplicates
    const combined = [...new Set([...roomSuggestions, ...generalSuggestions])];
    return combined.sort();
  };

  const suggestions = getRoomSpecificSuggestions();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <Box className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={onClose}>
              <ThemedText className="text-primary-500">Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText className="text-lg font-semibold">
              Add Objects
            </ThemedText>
            <TouchableOpacity onPress={handleSave}>
              <ThemedText className="text-primary-500 font-semibold">
                Save
              </ThemedText>
            </TouchableOpacity>
          </Box>

          <ScrollView className="flex-1 px-4">
            {/* Instructions */}
            <Box className="py-4">
              <ThemedText className="text-gray-600 mb-4">
                Add objects you see in this room. This helps improve our room
                detection.
              </ThemedText>

              {/* Custom Input */}
              <Box className="flex-row items-center gap-2 mb-6">
                <TextInput
                  value={customLabel}
                  onChangeText={setCustomLabel}
                  placeholder="Add custom object..."
                  onSubmitEditing={handleAddCustomLabel}
                  returnKeyType="done"
                  className="flex-1 h-10 px-3 border border-gray-300 rounded-lg"
                />
                <TouchableOpacity
                  onPress={handleAddCustomLabel}
                  className="h-10 w-10 items-center justify-center bg-primary-500 rounded-lg"
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
              </Box>

              {/* Selected Labels */}
              {selectedLabels.size > 0 && (
                <Box className="mb-6">
                  <ThemedText className="text-sm font-semibold text-gray-700 mb-2">
                    Selected Objects ({selectedLabels.size})
                  </ThemedText>
                  <Box className="flex-row flex-wrap gap-2">
                    {Array.from(selectedLabels).map((label) => (
                      <TouchableOpacity
                        key={label}
                        onPress={() => toggleLabel(label)}
                        className="bg-primary-100 px-3 py-1.5 rounded-full flex-row items-center gap-1"
                      >
                        <ThemedText className="text-sm text-primary-700">
                          {label}
                        </ThemedText>
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color="#374151"
                        />
                      </TouchableOpacity>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Suggestions */}
              <Box>
                <ThemedText className="text-sm font-semibold text-gray-700 mb-2">
                  Common Objects for{" "}
                  {roomType
                    .split("_")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </ThemedText>
                <Box className="flex-row flex-wrap gap-2">
                  {suggestions.map((suggestion) => {
                    const isSelected = selectedLabels.has(suggestion);
                    return (
                      <TouchableOpacity
                        key={suggestion}
                        onPress={() => toggleLabel(suggestion)}
                        className={`px-3 py-1.5 rounded-full border ${
                          isSelected
                            ? "bg-primary-500 border-primary-500"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <ThemedText
                          className={`text-sm ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {suggestion}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default AddObjectLabelsModal;
