import React from "react";
import { Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { IncidentSeverity } from "@/lib/@types/properties";

interface SeveritySelectorProps {
  selectedSeverity: IncidentSeverity;
  onSelectSeverity: (severity: IncidentSeverity) => void;
  showDescriptions?: boolean;
}

interface SeverityOption {
  level: IncidentSeverity;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: IconSymbolName;
  description: string;
}

const severityOptions: SeverityOption[] = [
  {
    level: IncidentSeverity.Low,
    color: "text-green-700",
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
    icon: "checkmark.circle",
    description: "Minor cosmetic issues, no immediate action needed",
  },
  {
    level: IncidentSeverity.Medium,
    color: "text-yellow-700",
    bgColor: "bg-yellow-500",
    borderColor: "border-yellow-500",
    icon: "exclamationmark.triangle",
    description: "Requires attention but not urgent, schedule repair",
  },
  {
    level: IncidentSeverity.High,
    color: "text-orange-700",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-500",
    icon: "exclamationmark.2",
    description: "Significant issue requiring prompt attention",
  },
  {
    level: IncidentSeverity.Critical,
    color: "text-red-700",
    bgColor: "bg-red-500",
    borderColor: "border-red-500",
    icon: "exclamationmark.octagon",
    description: "Emergency situation, immediate action required",
  },
];

export const SeveritySelector: React.FC<SeveritySelectorProps> = ({
  selectedSeverity,
  onSelectSeverity,
  showDescriptions = false,
}) => {
  return (
    <Box>
      <ThemedText className="font-semibold mb-3">Severity Level*</ThemedText>

      {showDescriptions ? (
        // Detailed View with Descriptions
        <VStack className="gap-3">
          {severityOptions.map((option) => (
            <Pressable
              key={option.level}
              onPress={() => onSelectSeverity(option.level)}
              className={`p-4 rounded-lg border-2 ${
                selectedSeverity === option.level
                  ? `${option.bgColor} ${option.borderColor}`
                  : "bg-white border-gray-200"
              }`}
            >
              <HStack className="items-start">
                <Box
                  className={`w-10 h-10 rounded-full justify-center items-center ${
                    selectedSeverity === option.level
                      ? "bg-white/20"
                      : option.bgColor
                  }`}
                >
                  <IconSymbol
                    name={option.icon}
                    size={20}
                    color={
                      selectedSeverity === option.level ? "white" : "white"
                    }
                  />
                </Box>
                <VStack className="ml-3 flex-1">
                  <ThemedText
                    className={`font-semibold text-base ${
                      selectedSeverity === option.level
                        ? "text-white"
                        : "text-gray-900"
                    }`}
                  >
                    {option.level}
                  </ThemedText>
                  <ThemedText
                    className={`text-sm mt-1 ${
                      selectedSeverity === option.level
                        ? "text-white/90"
                        : "text-gray-600"
                    }`}
                  >
                    {option.description}
                  </ThemedText>
                </VStack>
                {selectedSeverity === option.level && (
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={24}
                    color="white"
                  />
                )}
              </HStack>
            </Pressable>
          ))}
        </VStack>
      ) : (
        // Compact View
        <HStack className="gap-2">
          {severityOptions.map((option) => (
            <Pressable
              key={option.level}
              onPress={() => onSelectSeverity(option.level)}
              className={`flex-1 py-3 px-2 rounded-lg border-2 ${
                selectedSeverity === option.level
                  ? `${option.bgColor} ${option.borderColor}`
                  : "bg-white border-gray-200"
              }`}
            >
              <VStack className="items-center">
                <IconSymbol
                  name={option.icon}
                  size={24}
                  color={
                    selectedSeverity === option.level ? "white" : "#6B7280"
                  }
                />
                <ThemedText
                  className={`text-center font-medium mt-1 text-sm ${
                    selectedSeverity === option.level
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {option.level}
                </ThemedText>
              </VStack>
            </Pressable>
          ))}
        </HStack>
      )}
    </Box>
  );
};
