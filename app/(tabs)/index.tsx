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
      { id: 1, description: " New incident reported at Property A" },
      { id: 2, description: " Maintenance completed at Property B" },
      { id: 3, description: "Document updated for Property C" },
    ];

    setProperties(mockProperties);
    setIncidents(mockIncidents);
    setRecentActivity(mockActivity);
  }, []);


  return (
    <ParallaxScrollView
    headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
       <ThemedText type="title">Welcome!</ThemedText>
        <Text>{user?.email}</Text>
        <HelloWave />
        <Button onPress={onLogout}>
          <ButtonText>Log Out</ButtonText>
        </Button>

      <HStack space="lg" reversed={false} style={styles.metricsContainer}>
        <Box style={[styles.metrics, styles.margin]}>
          <ThemedText type='subtitle' style={styles.metricTitle}>Active Properties</ThemedText>
          <ThemedView>
            <ThemedText style={styles.metricValue}>{properties.length}</ThemedText>
          </ThemedView>
        </Box>
        <Box style={[styles.metrics, styles.margin]}>
          <ThemedText type='subtitle' style={styles.metricTitle}>Open Incidents</ThemedText>
          <ThemedView>
            <ThemedText style={styles.metricValue}>{incidents.length}</ThemedText>
          </ThemedView>
        </Box>
      </HStack>

      <Box style={[styles.activity, styles.margin]}>
        <ThemedText type='subtitle' style={styles.sectionTitle}>Recent Activity</ThemedText>
        {recentActivity.length > 0 ? (
          recentActivity.map((activity) => (
            <ThemedText key={activity.id}>{activity.description}</ThemedText>
          ))
        ) : (
          <ThemedText type='default'>No recent activity</ThemedText>
        )}
      </Box>

      <Box style={[styles.actions, styles.margin, styles.centerContent]}>
        <ThemedText type="subtitle" style={styles.sectionTitle} >
          Quick Actions
        </ThemedText>
        <HStack space="md">
          <Button style={styles.quickActionButton} onPress={addProperty}>
            <IconSymbol size={28} name="building.2.fill" color='grey' />
            <ButtonText>Add Property</ButtonText>
          </Button>
          <Button style={styles.quickActionButton} onPress={newIncident}>
            <IconSymbol size={28} name="exclamationmark.triangle.fill" color='grey' />
            <ButtonText>New Incident</ButtonText>
          </Button>
        </HStack>
      </Box>


    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  metricsContainer: {
    justifyContent: "center",
    paddingHorizontal: 8,
    marginBottom: 5,
  },

  metrics: {
    height: 80,
    width: '60%',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#eff3f0',
    borderWidth: 2,
  },

  activity: {
    height: 200,
    width: 373,
    marginLeft: '-10%',
    marginRight: '-10%',
    padding: 8,
    borderRadius: 8,
    borderColor: '#eff3f0',
    borderWidth: 2,
  },

  actions: {
    height: 200,
    width: 373,
    marginLeft: '-10%', 
    marginRight: '-10%',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#eff3f0',
    borderWidth: 2,
  },

  margin: {
    marginBottom: 5,
  },

  metricTitle: {
    textAlign: "center",
  },

  metricValue: {
    fontSize: 24,
    textAlign: "center",
  },

  sectionTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },

  quickActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    height: 96,
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    textAlign: 'center',
    marginBottom: 8,
  },

});
