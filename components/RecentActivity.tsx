import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Box } from '@/components/ui/box';

export default function RecentActivity() {

const [recentActivity, setRecentActivity] = useState<{ id: number; description: string }[]>([]);

useEffect(() => {
    setRecentActivity([{ id: 1, description: "New incident reported at Property A" }, { id: 2, description: "Maintenance completed at Property B" }, { id: 3, description: "Document updated for Property C" }]);
}, []);


return (
    <Box className="h-48 w-full mx-auto p-2 rounded-lg border-2">
        <ThemedText type='subtitle' className="mb-2 text-center">Recent Activity</ThemedText>
            <ThemedView>
            {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
        <ThemedText key={activity.id}>{activity.description}</ThemedText>
        ))
        ) : (
        <ThemedText type='default'>No recent activity</ThemedText>
        )}
            </ThemedView>
    </Box>
    );
}
