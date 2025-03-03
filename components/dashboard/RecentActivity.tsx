import React, { useState, useEffect } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Box } from '@/components/ui/box';

// Define an interface for the activity item
interface ActivityItem {
  id: number;
  description: string;
}

export default function RecentActivity(): JSX.Element {
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    setRecentActivity([
      { id: 1, description: "New incident reported at Property A" },
      { id: 2, description: "Maintenance completed at Property B" },
      { id: 3, description: "Document updated for Property C" },
      { id: 4, description: "Tenant moved into Property D" },
      { id: 5, description: "Inspection scheduled for Property E" },
      { id: 6, description: "Inspection scheduled for Property E" },
      { id: 7, description: "Tenant moved into Property D" },
      { id: 8, description: "Inspection scheduled for Property E" },
      { id: 9, description: "Inspection scheduled for Property E" }
    ]);
  }, []);

  return (
    <Box className="w-full mx-auto p-2 rounded-lg border-2">
      <ThemedText type='subtitle' className="mb-2 text-center">Recent Activity</ThemedText>
      <ScrollView
        style={{ maxHeight: 200 }}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <ThemedView>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <ThemedText key={activity.id} className='mb-1'>
                {activity.description}
              </ThemedText>
            ))
          ) : (
            <ThemedText type='default'>No recent activity</ThemedText>
          )}
        </ThemedView>
      </ScrollView>
    </Box>
  );
}
