import { useEffect, useState } from "react";
import { View, SafeAreaView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Header from "@/components/Header";
import IncidentSearch from "@/components/incidents/search";
import IncidentList from "@/components/incidents/list";
import IncidentMetrics from "@/components/incidents/details/IncidentMetrics";
import {
  Incident,
  incidents as allIncidentsData,
} from "@/components/incidents/data/incidents";
import { useLocalSearchParams } from "expo-router";

const IncidentsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [allIncidents, setAllIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);

  const params = useLocalSearchParams();
  const propertyId = params.propertyId
    ? parseInt(params.propertyId as string)
    : null;

  useEffect(() => {
    let incidents = [...allIncidentsData];

    if (propertyId) {
      incidents = incidents.filter(
        (incident) => incident.property_id === propertyId,
      );
    }

    setAllIncidents(incidents);
    setFilteredIncidents(incidents);
  }, [propertyId]);

  useEffect(() => {
    let filtered = [...allIncidents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (incident) =>
          incident.incident_type.toLowerCase().includes(query) ||
          incident.description.toLowerCase().includes(query),
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (incident) => incident.status === statusFilter,
      );
    }

    setFilteredIncidents(filtered);
  }, [searchQuery, statusFilter, allIncidents]);

  return (
    <ThemedView className="flex-1">
      <Header />
      <SafeAreaView className="flex-1 flex-col">
        <View className="z-10 px-4 p-2">
          <IncidentSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </View>
        <IncidentMetrics incidents={filteredIncidents} />
        <View className="flex-1">
          <IncidentList incidents={filteredIncidents} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default IncidentsScreen;
