import React, { useMemo } from "react";
import {
  ScrollView,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { HStack } from "../ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useGetProperties } from "@/hooks/properties/useGetProperties";
import { useGetIncidents } from "@/hooks/incidents/useGetIncidents";
import { Property, Incident } from "@/lib/@types/properties";

interface ActivityItem {
  id: string;
  type:
    | "incident"
    | "maintenance"
    | "document"
    | "tenant"
    | "inspection"
    | "property_created";
  timestamp: string;
  description: string;
  details: any;
}

export default function RecentActivity(): JSX.Element {
  const {
    properties: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useGetProperties({
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    incidents: incidentsData,
    isLoading: incidentsLoading,
    error: incidentsError,
    refetch: refetchIncidents,
  } = useGetIncidents({
    limit: 10,
    sortBy: "reportedAt",
    sortOrder: "desc",
  });

  const isLoading = propertiesLoading || incidentsLoading;
  const hasError = propertiesError || incidentsError;

  const recentActivity = useMemo(() => {
    const activities: ActivityItem[] = [];

    if (propertiesData?.data) {
      propertiesData.data.forEach((property: Property) => {
        activities.push({
          id: `property-${property.id}`,
          type: "property_created",
          timestamp: property.createdAt,
          description: `New property : ${property.address}`,
          details: property,
        });
      });
    }

    if (incidentsData) {
      incidentsData.forEach((incident: Incident) => {
        activities.push({
          id: `incident-${incident.id}`,
          type: "incident",
          timestamp: incident.reportedAt,
          description: `${incident.incidentType} incident reported${incident.property ? ` at ${incident.property.address}` : ""}`,
          details: incident,
        });
      });
    }

    // TODO: Add other activity types when hooks are available
    // You can add these as you create the hooks:

    // Add inspections
    // if (inspectionsData) {
    //   inspectionsData.forEach((inspection) => {
    //     activities.push({
    //       id: `inspection-${inspection.id}`,
    //       type: "inspection",
    //       timestamp: inspection.inspectionDate,
    //       description: `Inspection scheduled for ${inspection.property?.address}`,
    //       details: inspection,
    //     });
    //   });
    // }

    // Add maintenance activities
    // if (maintenanceData) {
    //   maintenanceData.forEach((maintenance) => {
    //     activities.push({
    //       id: `maintenance-${maintenance.id}`,
    //       type: "maintenance",
    //       timestamp: maintenance.completedAt || maintenance.scheduledAt,
    //       description: `Maintenance ${maintenance.status} at ${maintenance.property?.address}`,
    //       details: maintenance,
    //     });
    //   });
    // }

    // Add document activities
    // if (documentsData) {
    //   documentsData.forEach((document) => {
    //     activities.push({
    //       id: `document-${document.id}`,
    //       type: "document",
    //       timestamp: document.updatedAt,
    //       description: `Document updated: ${document.title}`,
    //       details: document,
    //     });
    //   });
    // }

    // Add tenant activities
    // if (tenantsData) {
    //   tenantsData.forEach((tenant) => {
    //     activities.push({
    //       id: `tenant-${tenant.id}`,
    //       type: "tenant",
    //       timestamp: tenant.createdAt,
    //       description: `New tenant added: ${tenant.firstName} ${tenant.lastName}`,
    //       details: tenant,
    //     });
    //   });
    // }

    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 8);
  }, [propertiesData, incidentsData]);

  const refetchAll = () => {
    refetchProperties();
    refetchIncidents();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "incident":
        return "exclamationmark.triangle.fill";
      case "maintenance":
        return "wrench.fill";
      case "document":
        return "doc.text.fill";
      case "tenant":
        return "person.fill";
      case "inspection":
        return "magnifyingglass";
      case "property_created":
        return "house.fill";
      default:
        return "circle.fill";
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case "incident":
        return "#DC2626"; // Red
      case "maintenance":
        return "#D97706"; // Orange
      case "document":
        return "#2563EB"; // Blue
      case "tenant":
        return "#059669"; // Green
      case "inspection":
        return "#7C3AED"; // Purple
      case "property_created":
        return "#059669"; // Green
      default:
        return "#6B7280"; // Gray
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60),
      );

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(
          (now.getTime() - date.getTime()) / (1000 * 60),
        );
        return diffInMinutes < 1 ? "Just now" : `${diffInMinutes} minutes ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return date.toLocaleDateString();
      }
    } catch (e) {
      return timestamp;
    }
  };

  if (isLoading) {
    return (
      <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
        <ThemedText type="defaultSemiBold" className="text-left mb-2">
          Recent Activity
        </ThemedText>
        <Box className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#6B7280" />
          <ThemedText className="text-center mt-2 text-gray-500">
            Loading recent activity...
          </ThemedText>
        </Box>
      </Box>
    );
  }

  if (hasError) {
    return (
      <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
        <ThemedText type="defaultSemiBold" className="text-left mb-2">
          Recent Activity
        </ThemedText>
        <Box className="flex-1 justify-center items-center py-8">
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={32}
            color="#DC2626"
          />
          <ThemedText className="text-center mt-2 text-red-600">
            Error loading activity
          </ThemedText>
          <ThemedText
            className="text-center mt-1 text-blue-600 underline"
            onPress={refetchAll}
          >
            Tap to retry
          </ThemedText>
        </Box>
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
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetchAll}
            colors={["#6B7280"]}
          />
        }
      >
        <View>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
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
                    <ThemedText>
                      {formatTimestamp(activity.timestamp)}
                    </ThemedText>
                  </Box>
                </HStack>
              </Box>
            ))
          ) : (
            <Box className="flex-1 justify-center items-center py-8">
              <IconSymbol name="clock.fill" size={32} color="#9CA3AF" />
              <ThemedText className="text-center mt-2 text-gray-500">
                No recent activity
              </ThemedText>
            </Box>
          )}
        </View>
      </ScrollView>
    </Box>
  );
}
