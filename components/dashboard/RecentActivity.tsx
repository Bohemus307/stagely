import React, { useState, useEffect } from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth0 } from "react-native-auth0";
import Constants from "expo-constants";
import { useGetIncidents } from "@/hooks/incidents/useGetIncidents";
import { useGetProperties } from "@/hooks/properties/useGetProperties";
import { getTimeAgo } from "@/components/incidents/lib/utils/incidentHelpers";

enum ActivityType {
  Incident = "incident",
  Maintenance = "maintenance",
  Document = "document",
  Tenant = "tenant",
  Inspection = "inspection",
  PropertyUpdate = "property_update",
}

interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
  type: ActivityType;
  entityId: number;
  propertyId?: number;
  propertyName?: string;
}

interface IncidentType {
  id: number;
  incidentType?: string;
  status: string;
  reportedAt?: string;
  createdAt: string;
  propertyId: number;
  property?: {
    address?: string;
  };
}

interface PropertyType {
  id: number;
  address: string;
  updatedAt: string;
}

interface InspectionType {
  id: number;
  title?: string;
  updatedAt?: string;
  createdAt: string;
  propertyId: number;
  property?: {
    address?: string;
  };
}

export default function RecentActivity(): JSX.Element {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { getCredentials } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { incidents, isLoading: incidentsLoading } = useGetIncidents({
    limit: 5,
    sortBy: "reportedAt",
    sortOrder: "desc",
  });

  const { properties, isLoading: propertiesLoading } = useGetProperties({
    limit: 5,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    const createActivities = async () => {
      try {
        const activityItems: ActivityItem[] = [];

        if (incidents && incidents.length > 0) {
          const incidentActivities = incidents.map(
            (incident: IncidentType) => ({
              id: `incident-${incident.id}`,
              description: `${incident.status === "Resolved" ? "Resolved" : "New"} incident: ${incident.incidentType || "Issue"} at ${incident.property?.address || "a property"}`,
              timestamp: incident.reportedAt || incident.createdAt,
              type: ActivityType.Incident,
              entityId: incident.id,
              propertyId: incident.propertyId,
              propertyName: incident.property?.address,
            }),
          );

          activityItems.push(...incidentActivities);
        }

        if (properties && properties.length > 0) {
          const propertyActivities = properties.map(
            (property: PropertyType) => ({
              id: `property-${property.id}`,
              description: `Property updated: ${property.address}`,
              timestamp: property.updatedAt,
              type: ActivityType.PropertyUpdate,
              entityId: property.id,
              propertyId: property.id,
              propertyName: property.address,
            }),
          );

          activityItems.push(...propertyActivities);
        }

        try {
          const credentials = await getCredentials();
          if (credentials?.accessToken) {
            const inspectionsResponse = await fetch(
              `https://${apiUrl}/properties/inspections?limit=5&sortOrder=desc`,
              {
                headers: {
                  Authorization: `Bearer ${credentials.accessToken}`,
                  "Content-Type": "application/json",
                },
              },
            );

            if (inspectionsResponse.ok) {
              const responseData = await inspectionsResponse.json();

              const inspectionsData = Array.isArray(responseData)
                ? responseData
                : responseData.data && Array.isArray(responseData.data)
                  ? responseData.data
                  : null;

              if (inspectionsData && inspectionsData.length > 0) {
                const inspectionActivities = inspectionsData.map(
                  (inspection: InspectionType) => ({
                    id: `inspection-${inspection.id}`,
                    description: `${inspection.title || "Inspection"} at ${inspection.property?.address || "a property"}`,
                    timestamp: inspection.updatedAt || inspection.createdAt,
                    type: ActivityType.Inspection,
                    entityId: inspection.id,
                    propertyId: inspection.propertyId,
                    propertyName: inspection.property?.address,
                  }),
                );

                activityItems.push(...inspectionActivities);
              }
            } else {
              console.warn(
                "Failed to fetch inspections:",
                inspectionsResponse.statusText,
              );
            }
          }
        } catch (inspectionError) {
          console.warn("Error fetching inspections:", inspectionError);
        }

        const sortedActivities = activityItems
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, 8);

        setActivities(sortedActivities);
      } catch (err) {
        console.error("Error creating activities:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    if (!incidentsLoading && !propertiesLoading) {
      createActivities();
    }
  }, [
    incidents,
    properties,
    incidentsLoading,
    propertiesLoading,
    apiUrl,
    getCredentials,
  ]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.Incident:
        return "exclamationmark.triangle.fill";
      case ActivityType.Maintenance:
        return "wrench.fill";
      case ActivityType.Document:
        return "doc.text.fill";
      case ActivityType.Tenant:
        return "person.fill";
      case ActivityType.Inspection:
        return "magnifyingglass";
      case ActivityType.PropertyUpdate:
        return "building.2.fill";
      default:
        return "circle.fill";
    }
  };

  const getActivityIconColor = (type: ActivityType) => {
    switch (type) {
      case ActivityType.Incident:
        return "#DC2626";
      case ActivityType.Maintenance:
        return "#D97706";
      case ActivityType.Document:
        return "#2563EB";
      case ActivityType.Tenant:
        return "#059669";
      case ActivityType.Inspection:
        return "#7C3AED";
      case ActivityType.PropertyUpdate:
        return "#0891B2";
      default:
        return "#6B7280";
    }
  };

  if (isLoading || incidentsLoading || propertiesLoading) {
    return (
      <Box
        className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2 items-center justify-center"
        style={{ minHeight: 200 }}
      >
        <ActivityIndicator size="large" color="#0000ff" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
        <ThemedText type="defaultSemiBold" className="text-left mb-2">
          Recent Activity
        </ThemedText>
        <ThemedText className="text-center text-red-500">
          Error loading activities: {error.message}
        </ThemedText>
      </Box>
    );
  }

  return (
    <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
      <ThemedText type="defaultSemiBold" className="text-left mb-2">
        Recent Activity
      </ThemedText>
      <ScrollView
        style={{ maxHeight: 250 }}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <View>
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <Box key={activity.id} className="mb-0 pb-3">
                <HStack className="items-start">
                  <Box style={{ marginTop: 4 }}>
                    <IconSymbol
                      name={getActivityIcon(activity.type)}
                      size={20}
                      color={getActivityIconColor(activity.type)}
                    />
                  </Box>
                  <Box className="flex-1 ml-2">
                    <ThemedText type="defaultSemiBold">
                      {activity.description}
                    </ThemedText>
                    <ThemedText>{getTimeAgo(activity.timestamp)}</ThemedText>
                  </Box>
                </HStack>
              </Box>
            ))
          ) : (
            <ThemedText className="text-center text-gray-500">
              No recent activity
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </Box>
  );
}
