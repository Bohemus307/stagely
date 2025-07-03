import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { ActivityIndicator } from "react-native";
import { useGetProperties } from "@/hooks/properties/useGetProperties";
import { useGetIncidents } from "@/hooks/incidents/useGetIncidents";
import {
  Property,
  Incident,
  PropertyStatus,
  IncidentStatus,
} from "@/lib/@types/properties";

interface MetricItem {
  title: string;
  value: number;
  isLoading?: boolean;
}

export default function MetricsCard(): JSX.Element {
  const {
    properties: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useGetProperties({
    limit: 100,
  });

  const {
    incidents: incidentsData,
    isLoading: incidentsLoading,
    error: incidentsError,
    refetch: refetchIncidents,
  } = useGetIncidents({
    limit: 100,
  });

  const isLoading = propertiesLoading || incidentsLoading;
  const hasError = propertiesError || incidentsError;

  // Handle loading state
  if (isLoading) {
    return (
      <ThemedView>
        <Box className="p-2 rounded-2xl flex flex-col items-center justify-center mt-2 mb-0">
          <HStack className="justify-center px-2 mb-2 w-full gap-4">
            <Box className="min-h-24 w-1/2 p-4 rounded-lg flex flex-col justify-center shadow-sm bg-white">
              <ThemedText className="text-left text-black font-semibold font-roboto mb-1">
                Active Properties
              </ThemedText>
              <ActivityIndicator size="small" color="#000" />
            </Box>
            <Box className="min-h-24 w-1/2 p-4 rounded-lg flex flex-col justify-center shadow-sm bg-white">
              <ThemedText className="text-left text-black font-semibold font-roboto mb-1">
                Open Incidents
              </ThemedText>
              <ActivityIndicator size="small" color="#000" />
            </Box>
          </HStack>
        </Box>
      </ThemedView>
    );
  }

  // Enhanced error state with specific error details
  if (hasError) {
    return (
      <ThemedView>
        <Box className="p-2 rounded-2xl flex flex-col items-center justify-center mt-2 mb-0">
          <HStack className="justify-center px-2 mb-2 w-full gap-4">
            <Box className="min-h-32 w-1/2 p-4 rounded-lg flex flex-col justify-center shadow-sm bg-white">
              <ThemedText className="text-left text-red-600 font-semibold font-roboto mb-1">
                {propertiesError ? "Properties Error" : "Active Properties"}
              </ThemedText>
              {propertiesError ? (
                <>
                  <ThemedText className="text-xs text-red-500 mb-2">
                    {propertiesError.message || "Unknown error"}
                  </ThemedText>
                  <ThemedText
                    className="text-sm text-blue-600 underline"
                    onPress={() => refetchProperties()}
                  >
                    Retry Properties
                  </ThemedText>
                </>
              ) : (
                <ThemedText className="text-2xl font-semibold font-roboto text-left">
                  {propertiesData?.data?.length || 0}
                </ThemedText>
              )}
            </Box>
            <Box className="min-h-32 w-1/2 p-4 rounded-lg flex flex-col justify-center shadow-sm bg-white">
              <ThemedText className="text-left text-red-600 font-semibold font-roboto mb-1">
                {incidentsError ? "Incidents Error" : "Open Incidents"}
              </ThemedText>
              {incidentsError ? (
                <>
                  <ThemedText className="text-xs text-red-500 mb-2">
                    {incidentsError.message || "Unknown error"}
                  </ThemedText>
                  <ThemedText
                    className="text-sm text-blue-600 underline"
                    onPress={() => refetchIncidents()}
                  >
                    Retry Incidents
                  </ThemedText>
                </>
              ) : (
                <ThemedText className="text-2xl font-semibold font-roboto text-left">
                  {incidentsData?.length || 0}
                </ThemedText>
              )}
            </Box>
          </HStack>
        </Box>
      </ThemedView>
    );
  }

  // Calculate metrics
  const allProperties = propertiesData?.data || [];
  const allIncidents = incidentsData || [];

  // Filter active properties
  const activeProperties = allProperties.filter(
    (property: Property) => property.status === PropertyStatus.Active,
  );

  // Filter open incidents
  const openIncidents = allIncidents.filter(
    (incident: Incident) => incident.status === IncidentStatus.Open,
  );

  const metricItems: MetricItem[] = [
    {
      title: "Active Properties",
      value: activeProperties.length,
    },
    {
      title: "Open Incidents",
      value: openIncidents.length,
    },
  ];

  return (
    <ThemedView>
      <Box className="p-2 rounded-2xl flex flex-col items-center justify-center mt-2 mb-0">
        <HStack className="justify-center px-2 mb-2 w-full gap-4">
          {metricItems.map((item, index) => (
            <Box
              key={index}
              className="min-h-24 w-1/2 p-4 rounded-lg flex flex-col justify-center shadow-sm bg-white"
            >
              <ThemedText className="text-left text-black font-semibold font-roboto mb-1">
                {item.title}
              </ThemedText>
              <ThemedText className="text-2xl font-semibold font-roboto text-left">
                {item.value}
              </ThemedText>
            </Box>
          ))}
        </HStack>
      </Box>
    </ThemedView>
  );
}
