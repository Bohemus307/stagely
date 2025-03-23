import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { HStack } from "../ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";

// Define an interface for the activity item
interface ActivityItem {
  id: number;
  description: string;
  timestamp: string;
  type: "incident" | "maintenance" | "document" | "tenant" | "inspection";
}

export default function RecentActivity(): JSX.Element {
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    setRecentActivity([
      {
        id: 1,
        description: "New incident reported at Property A",
        timestamp: "2 hours ago",
        type: "incident",
      },
      {
        id: 6,
        description: "Inspection scheduled for Property E",
        timestamp: "Yesterday, 10:15 AM",
        type: "inspection",
      },
      {
        id: 2,
        description: "Maintenance completed at Property B",
        timestamp: "4 hours ago",
        type: "maintenance",
      },
      {
        id: 7,
        description: "Document updated for Property C",
        timestamp: "Yesterday, 3:45 PM",
        type: "document",
      },
      {
        id: 3,
        description: "New incident reported at Property A",
        timestamp: "2 hours ago",
        type: "incident",
      },
      {
        id: 4,
        description: "Maintenance completed at Property B",
        timestamp: "4 hours ago",
        type: "maintenance",
      },
      {
        id: 5,
        description: "Document updated for Property C",
        timestamp: "Yesterday, 3:45 PM",
        type: "document",
      },

      {
        id: 8,
        description: "Inspection scheduled for Property E",
        timestamp: "Yesterday, 10:15 AM",
        type: "inspection",
      },
    ]);
  }, []);

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
      default:
        return "circle.fill";
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case "incident":
        return "#DC2626";
      case "maintenance":
        return "#D97706";
      case "document":
        return "#2563EB";
      case "tenant":
        return "#059669";
      case "inspection":
        return "#7C3AED";
      default:
        return "#6B7280";
    }
  };

  return (
    <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
      <ThemedText type="defaultSemiBold" className="text-left mb-2 ">
        Recent Activity
      </ThemedText>
      <ScrollView
        style={{ maxHeight: 250 }}
        contentContainerStyle={{ paddingBottom: 10 }}
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
                    <ThemedText>{activity.timestamp}</ThemedText>
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
