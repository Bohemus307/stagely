import React from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { HStack } from "../ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useGetUserEvents } from "@/hooks/events/useGetEvents";

export default function RecentActivity(): JSX.Element {
  const { events, isLoading, error } = useGetUserEvents({
    limit: 80,
  });

  const getActivityIcon = (entityType: string, eventType: string) => {
    // First check entity type
    switch (entityType) {
      case "incident":
        return "exclamationmark.triangle.fill";
      case "inspection":
        return "magnifyingglass";
      case "property_space":
        // Check specific property space event types
        if (eventType.includes("deleted")) return "trash.fill";
        if (eventType.includes("created")) return "plus.circle.fill";
        if (eventType.includes("updated")) return "pencil";
        if (eventType.includes("image_added")) return "photo.fill";
        if (eventType.includes("label_added")) return "tag.fill";
        if (eventType.includes("labels_updated")) return "tag.fill";
        return "building.2.fill";
      default:
        // Handle specific event types
        if (eventType.includes("document")) return "doc.text.fill";
        if (eventType.includes("maintenance")) return "wrench.fill";
        if (eventType.includes("tenant")) return "person.fill";
        return "circle.fill";
    }
  };

  const getActivityIconColor = (entityType: string, eventType: string) => {
    // Map entity types to colors
    switch (entityType) {
      case "incident":
        return "#DC2626"; // Red
      case "inspection":
        return "#7C3AED"; // Purple
      case "property_space":
        // Different colors based on property space event type
        if (eventType.includes("deleted")) return "#DC2626"; // Red
        if (eventType.includes("created")) return "#059669"; // Green
        if (eventType.includes("updated")) return "#2563EB"; // Blue
        if (eventType.includes("image_added")) return "#D97706"; // Orange
        if (eventType.includes("label_added")) return "#8B5CF6"; // Purple
        return "#0891b2"; // Cyan default for property spaces
      default:
        // Handle specific event types
        if (eventType.includes("document")) return "#2563EB"; // Blue
        if (eventType.includes("maintenance")) return "#D97706"; // Orange
        if (eventType.includes("tenant")) return "#059669"; // Green
        return "#6B7280"; // Gray default
    }
  };

  // Format event description based on event type and metadata
  const formatEventDescription = (event: any) => {
    const { eventType, entityType, metadata } = event;

    // Get property name or entity name from metadata
    const propertyId = metadata?.propertyId || "";
    const propertyAddress =
      metadata?.propertyAddress || `Property ${propertyId}`;

    // Format based on event type and entity type
    if (entityType === "incident") {
      switch (eventType) {
        case "incident.created":
          return `New incident reported: ${metadata?.description || ""} at ${propertyAddress}`;
        case "incident.resolved":
          return `Incident resolved at ${propertyAddress}`;
        case "incident.escalated":
          return `Incident escalated: ${metadata?.description || ""} at ${propertyAddress}`;
        default:
          return `Incident update at ${propertyAddress}`;
      }
    } else if (entityType === "property_space") {
      const spaceName = metadata?.name || "";
      const spaceType = metadata?.spaceType || "";

      switch (eventType) {
        case "property.space.created":
          return `${metadata?.aiGenerated ? "AI generated" : "New"} space created: ${spaceName} (${spaceType})`;
        case "property.space.updated":
          return `Space updated: ${spaceName || spaceType}`;
        case "property.space.deleted":
          return `Space deleted: ${spaceName} (${spaceType})`;
        case "property.space.image_added":
          return `Image added to ${spaceType} space`;
        case "property.space.label_added":
          return `Labels added to ${spaceType} space`;
        case "property.space.labels_updated":
          return `Labels updated for ${spaceType} space`;
        default:
          return `Space ${eventType.split(".").pop()} for ${propertyAddress}`;
      }
    } else {
      // Generic description for other event types
      return `${eventType.split(".").join(" ")} for Property ${propertyId}`;
    }
  };

  // Format timestamp to relative time without external libraries
  const formatTimestamp = (timestamp: number) => {
    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffMs = now.getTime() - date.getTime();

      // Convert to seconds, minutes, hours, days
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      // Format the date for display
      if (diffSecs < 60) {
        return "just now";
      } else if (diffMins < 60) {
        return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        // For older dates, show the date string
        const options: Intl.DateTimeFormatOptions = {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        };

        return date.toLocaleString("en-US", options);
      }
    } catch (error) {
      console.error("Error in timestamp events", error);
      return "Unknown";
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
        <ThemedText type="defaultSemiBold" className="text-left mb-2">
          Recent Activity
        </ThemedText>
        <View className="items-center justify-center py-4">
          <ActivityIndicator size="large" color="#0891b2" />
        </View>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
        <ThemedText type="defaultSemiBold" className="text-left mb-2">
          Recent Activity
        </ThemedText>
        <ThemedText className="text-center text-red-500 py-4">
          Error loading activities. Please try again.
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
        style={{ maxHeight: 350 }}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <View>
          {events.length > 0 ? (
            events.map((event) => (
              <Box key={event.eventId} className="mb-0 pb-3">
                <HStack className="items-start">
                  <Box style={{ marginTop: 4 }}>
                    <IconSymbol
                      name={getActivityIcon(event.entityType, event.eventType)}
                      size={20}
                      color={getActivityIconColor(
                        event.entityType,
                        event.eventType,
                      )}
                    />
                  </Box>
                  <Box className="flex-1 ml-2">
                    <ThemedText type="defaultSemiBold">
                      {formatEventDescription(event)}
                    </ThemedText>
                    <ThemedText>{formatTimestamp(event.timestamp)}</ThemedText>
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
