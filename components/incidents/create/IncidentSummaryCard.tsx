import React from "react";
import { ScrollView } from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Image } from "@/components/ui/image";
import { Property, IncidentSeverity } from "@/lib/@types/properties";
import { Colors } from "@/constants/Colors";
import { PhotoOption } from "@/components/incidents/create/PhotoSelector";

interface IncidentSummaryProps {
  property: Property | null;
  photo: PhotoOption | null;
  incidentType: string;
  severity: IncidentSeverity;
  description: string;
  spaceType?: string;
  incidentId?: number;
  status?: string;
  createdAt?: string;
  featureVector?: any;
  showSuccessHeader?: boolean;
}

export const IncidentSummaryCard: React.FC<IncidentSummaryProps> = ({
  property,
  photo,
  incidentType,
  severity,
  description,
  spaceType,
  incidentId,
  status,
  createdAt,
  featureVector,
  showSuccessHeader = false,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case IncidentSeverity.Critical:
        return "bg-red-100 text-red-700 border-red-200";
      case IncidentSeverity.High:
        return "bg-orange-100 text-orange-700 border-orange-200";
      case IncidentSeverity.Medium:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case IncidentSeverity.Low:
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <VStack className="p-4 gap-4">
        {/* Success Banner */}
        {showSuccessHeader && incidentId && (
          <Box className="bg-green-50 border border-green-200 p-4 rounded-xl">
            <HStack className="items-center">
              <IconSymbol
                name="checkmark.circle.fill"
                size={20}
                color="#10B981"
              />
              <VStack className="ml-3 flex-1">
                <ThemedText className="text-green-800 font-semibold">
                  Incident #{incidentId} Created
                </ThemedText>
                <ThemedText className="text-green-600 text-xs">
                  {createdAt
                    ? new Date(createdAt).toLocaleString()
                    : "Just now"}
                </ThemedText>
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Main Incident Card */}
        <Box className="bg-white rounded-xl border border-gray-200">
          {/* Photo */}
          {photo && (
            <Image
              source={{ uri: photo.uri }}
              className="w-full h-56 rounded-t-xl"
              resizeMode="cover"
            />
          )}

          <VStack className="p-4 gap-3">
            {/* Type & Severity Row */}
            <HStack className="gap-2">
              <Box className="flex-1">
                <ThemedText className="text-xs text-gray-500 mb-1">
                  Type
                </ThemedText>
                <ThemedText className="font-semibold">
                  {incidentType}
                </ThemedText>
              </Box>
              <Box>
                <ThemedText className="text-xs text-gray-500 mb-1">
                  Severity
                </ThemedText>
                <Box
                  className={`px-3 py-1 rounded-full border ${getSeverityColor()}`}
                >
                  <ThemedText className="font-semibold text-sm">
                    {severity}
                  </ThemedText>
                </Box>
              </Box>
            </HStack>

            {/* Location if available */}
            {spaceType && (
              <Box>
                <ThemedText className="text-xs text-gray-500 mb-1">
                  Location
                </ThemedText>
                <ThemedText className="font-medium">{spaceType}</ThemedText>
              </Box>
            )}

            {/* Property */}
            {property && (
              <Box className="pt-2 border-t border-gray-100">
                <ThemedText className="text-xs text-gray-500 mb-1">
                  Property
                </ThemedText>
                <ThemedText className="font-medium">
                  {property.address}
                </ThemedText>
                <ThemedText className="text-sm text-gray-600">
                  {property.city}, {property.state} {property.zipCode}
                </ThemedText>
              </Box>
            )}
          </VStack>
        </Box>

        {/* AI Analysis - Clean and Simple */}
        {featureVector?.claudeAnalysis && (
          <Box className="bg-primary-50 rounded-xl p-4 border border-primary-100">
            <HStack className="items-start mb-2">
              <IconSymbol name="sparkles" size={16} color={Colors.light.tint} />
              <ThemedText className="ml-2 font-semibold text-primary-900">
                AI Analysis
              </ThemedText>
            </HStack>
            <ThemedText className="text-sm text-primary-800 leading-5">
              {featureVector.claudeAnalysis}
            </ThemedText>

            {/* Comparison Image if available */}
            {featureVector.comparisonImageUrl && (
              <Image
                source={{ uri: featureVector.comparisonImageUrl }}
                className="w-full h-40 rounded-lg mt-3"
                resizeMode="cover"
              />
            )}

            {/* Change Summary if significant changes */}
            {featureVector.summary &&
              (featureVector.summary.totalAdded > 0 ||
                featureVector.summary.totalMoved > 0 ||
                featureVector.summary.totalRemoved > 0) && (
                <HStack className="mt-3 pt-3 border-t border-primary-100 gap-4">
                  <ThemedText className="text-xs text-primary-700">
                    Items Added: {featureVector.summary.totalAdded}
                  </ThemedText>
                  <ThemedText className="text-xs text-primary-700">
                    Items Moved: {featureVector.summary.totalMoved}
                  </ThemedText>
                  <ThemedText className="text-xs text-primary-700">
                    Items Removed: {featureVector.summary.totalRemoved}
                  </ThemedText>
                </HStack>
              )}
          </Box>
        )}

        {/* Next Steps - Only if submitted */}
        {incidentId && (
          <Box className="bg-gray-50 rounded-xl p-4">
            <ThemedText className="font-semibold mb-2">What's Next?</ThemedText>
            <VStack className="gap-1">
              <ThemedText className="text-sm text-gray-600">
                • Property management has been notified
              </ThemedText>
              <ThemedText className="text-sm text-gray-600">
                • Track progress in the Incidents tab
              </ThemedText>
              <ThemedText className="text-sm text-gray-600">
                • You'll receive updates on resolution
              </ThemedText>
            </VStack>
          </Box>
        )}
      </VStack>
    </ScrollView>
  );
};
