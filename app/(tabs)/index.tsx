import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth0 } from 'react-native-auth0';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  const { user, clearSession } = useAuth0();
  const router = useRouter();
  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const [incidents, setIncidents] = useState<{ id: number; description: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ id: number; description: string }[]>([]);

  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.log("Log out cancelled", e);
    }
  };

  const addProperty = () => {
    router.push('/properties');
  };

  const newIncident = () => {
    router.push('/incidents');
  };

  useEffect(() => {
    // Simulating backend data with mock data
    const mockProperties = [
      { id: 1, name: "Property A" },
      { id: 2, name: "Property B" },
      { id: 3, name: "Property C" },
    ];

    const mockIncidents = [
      { id: 1, description: "Leak in Property A" },
      { id: 2, description: "Power outage in Property B" },
    ];

    const mockActivity = [
      { id: 1, description: "🔵 New incident reported at Property A" },
      { id: 2, description: "🟢 Maintenance completed at Property B" },
      { id: 3, description: "🟡 Document updated for Property C" },
    ];

    setProperties(mockProperties);
    setIncidents(mockIncidents);
    setRecentActivity(mockActivity);
  }, []);


  return (
    <ParallaxScrollView
    headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <HStack space="lg" reversed={false} style={styles.metricsContainer}>
        <Box className='h-20 w-45 p-4 rounded-lg flex justify-center items-center border-2 border-gray-800'>
          <ThemedText type='subtitle' style={styles.metricTitle}>Active Properties</ThemedText>
          <ThemedView>
            <ThemedText style={styles.metricValue}>{properties.length}</ThemedText>
          </ThemedView>
        </Box>
        <Box className='h-20 w-45 p-4 rounded-lg flex justify-center items-center border-2 border-gray-800'>
          <ThemedText type='subtitle' style={styles.metricTitle}>Open Incidents</ThemedText>
          <ThemedView>
            <ThemedText style={styles.metricValue}>{incidents.length}</ThemedText>
          </ThemedView>
        </Box>
      </HStack>

      <Box className='w-full bg-primary-300 p-4 rounded-lg'>
        <ThemedText type='subtitle' className='mb-2'>Recent Activity</ThemedText>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity) => (
            <ThemedText key={activity.id}>{activity.description}</ThemedText>
          ))
        ) : (
          <ThemedText type='default'>No recent activity</ThemedText>
        )}
      </Box>

      <Box className='w-full bg-primary-300 p-4 rounded-lg flex justify-center items-center'>
        <ThemedText type="subtitle" className='mb-2 text-center'>
          Quick Actions
        </ThemedText>
        <HStack space="md" className=''>
          <Button className='flex-1 flex flex-col items-center justify-center gap-0 h-24' onPress={addProperty}>
            <IconSymbol size={28} name="building.2.fill" color='grey' />
            <ButtonText>Add Property</ButtonText>
          </Button>
          <Button className='flex-1 flex flex-col items-center justify-center gap-0 h-24' onPress={newIncident}>
            <IconSymbol size={28} name="exclamationmark.triangle.fill" color='grey' />
            <ButtonText>New Incident</ButtonText>
          </Button>
        </HStack>
      </Box>
      
        <ThemedText type="title">Welcome!</ThemedText>
        <Text>{user?.email}</Text>
        <HelloWave />
        <Button onPress={onLogout}>
          <ButtonText>Log Out</ButtonText>
        </Button>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  metricsContainer: {
    justifyContent: "center",
    paddingHorizontal: 8,
    marginBottom: 16,

  },

  metricTitle: {
    textAlign: "center",
  },

  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",

  },

  activitySection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
