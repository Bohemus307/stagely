import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import AddObjectLabelsModal from "./AddObjectLabelsModal";
import { Colors } from "@/constants/Colors";

interface ObjectLabel {
  name: string;
  confidence: string;
  category?: string;
}

interface DetectedObjectsListProps {
  objectLabels: ObjectLabel[];
  confidence: number;
  roomType: string;
  onLabelsUpdate?: (labels: ObjectLabel[]) => void;
}

const DetectedObjectsList: React.FC<DetectedObjectsListProps> = ({
  objectLabels,
  confidence,
  roomType,
  onLabelsUpdate,
}) => {
  const [showAddLabelsModal, setShowAddLabelsModal] = useState(false);
  const [manualLabels, setManualLabels] = useState<ObjectLabel[]>([]);

  // Combine AI-detected labels with manual labels
  const allLabels = [...objectLabels, ...manualLabels];
  const hasDetectedLabels = objectLabels.length > 0 && confidence >= 70;

  const handleSaveLabels = (labels: ObjectLabel[]) => {
    setManualLabels(labels);
    if (onLabelsUpdate) {
      onLabelsUpdate([...objectLabels, ...labels]);
    }
  };

  // If no objects detected or low confidence, show the add labels interface
  if (!hasDetectedLabels) {
    return (
      <>
        <Box className="mb-6 p-4 bg-amber-50 rounded-xl border border-secondary-500">
          <Box className="flex-row items-start gap-2 mb-3">
            <Ionicons
              name="information-circle"
              size={20}
              color={Colors.light.text}
            />
            <Box className="flex-1">
              <ThemedText className="text-sm font-semibold text-amber-800 mb-1">
                No objects detected
              </ThemedText>
              <ThemedText className="text-xs text-amber-700 mb-3">
                Help improve our detection by adding objects you see in this
                room.
              </ThemedText>
            </Box>
          </Box>

          {/* Show manual labels if any */}
          {manualLabels.length > 0 && (
            <Box className="flex-row flex-wrap gap-2 mb-3">
              {manualLabels.map((label, index) => (
                <Box
                  key={`manual-${index}`}
                  className="bg-white px-3 py-1 rounded-full border border-amber-200"
                >
                  <ThemedText className="text-xs text-amber-700">
                    {label.name}
                  </ThemedText>
                </Box>
              ))}
            </Box>
          )}

          <TouchableOpacity
            onPress={() => setShowAddLabelsModal(true)}
            className="bg-secondary-500 px-4 py-2 rounded-lg flex-row items-center justify-center gap-2"
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={Colors.light.text}
            />
            <ThemedText className="text-sm font-medium text-white">
              {manualLabels.length > 0 ? "Edit Labels" : "Add Labels"}
            </ThemedText>
          </TouchableOpacity>
        </Box>

        <AddObjectLabelsModal
          visible={showAddLabelsModal}
          currentLabels={manualLabels}
          roomType={roomType}
          onClose={() => setShowAddLabelsModal(false)}
          onSave={handleSaveLabels}
        />
      </>
    );
  }

  // Original behavior when objects are detected with high confidence
  return (
    <>
      <Box className="mb-6 p-4 bg-gray-50 rounded-xl">
        <Box className="flex-row items-center justify-between mb-2">
          <ThemedText className="text-sm font-semibold text-gray-700">
            What we spotted:
          </ThemedText>
          <TouchableOpacity
            onPress={() => setShowAddLabelsModal(true)}
            className="flex-row items-center gap-1"
          >
            <Ionicons name="add-circle-outline" size={16} color="#6B7280" />
            <ThemedText className="text-xs text-gray-600">Add more</ThemedText>
          </TouchableOpacity>
        </Box>
        <Box className="flex-row flex-wrap gap-2">
          {/* AI-detected labels */}
          {objectLabels.slice(0, 5).map((label, index) => (
            <Box
              key={`ai-${index}`}
              className="bg-white px-3 py-1 rounded-full border border-gray-200"
            >
              <ThemedText className="text-xs text-gray-600">
                {label.name} • {Math.round(parseFloat(label.confidence))}%
              </ThemedText>
            </Box>
          ))}
          {/* Manual labels */}
          {manualLabels.map((label, index) => (
            <Box
              key={`manual-${index}`}
              className="bg-primary-50 px-3 py-1 rounded-full border border-primary-200"
            >
              <ThemedText className="text-xs text-primary-700">
                {label.name}
              </ThemedText>
            </Box>
          ))}
        </Box>
      </Box>

      <AddObjectLabelsModal
        visible={showAddLabelsModal}
        currentLabels={allLabels}
        roomType={roomType}
        onClose={() => setShowAddLabelsModal(false)}
        onSave={handleSaveLabels}
      />
    </>
  );
};

export default DetectedObjectsList;
