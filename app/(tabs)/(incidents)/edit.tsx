import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { incidents } from "@/components/incidents/data/incidents";
import BackButton from "@/components/BackButton";
import { Incident } from "@/lib/@types/properties";

const IncidentEditScreen = () => {
  const { incidentId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<Incident | null>(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        // Get the property from the properties data file
        const id = parseInt(incidentId as string);
        const fetchedIncident = incidents.find((p) => p.property_id === id);

        if (fetchedIncident) {
          setIncident(fetchedIncident as unknown as Incident); // Fix me 😹
        }
      } catch (error) {
        console.error("Error fetching incident:", error);
        // Handle the error appropriately
      } finally {
        setLoading(false);
      }
    };

    fetchIncident();
  }, [incidentId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </View>
    );
  }

  if (!incident) {
    return (
      <View className="flex-1 justify-center items-center">
        <BackButton />
        <Text>Incident not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1">
        <BackButton />
        <Text>EDIT</Text>
      </SafeAreaView>
    </View>
  );
};

export default IncidentEditScreen;
