import { useState } from "react";
import { View } from "react-native";
import IncidentSearch from "@/components/incidents/search";
import IncidentList from "@/components/incidents/list";
import IncidentMetrics from "@/components/incidents/details/IncidentMetrics";
import { useLocalSearchParams } from "expo-router";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import { useGetIncidents } from "@/hooks/incidents/useGetIncidents";
import { Incident } from "@/lib/@types/properties";

const IncidentsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const params = useLocalSearchParams();
  const propertyId = params.propertyId
    ? parseInt(params.propertyId as string)
    : undefined;

  const { incidents, isLoading, error, refetch } = useGetIncidents({
    propertyId,
    status: statusFilter as any,
    severity: statusFilter === "High" ? "High" : undefined,
    page: 1,
    limit: 50,
    sortBy: "reportedAt",
    sortOrder: "desc",
  });

  const filteredIncidents = incidents || [];

  const displayedIncidents = searchQuery
    ? filteredIncidents.filter(
        (incident: Incident) =>
          incident.incidentType
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          incident.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : filteredIncidents;

  return (
    <ResponsiveScreenWrapper scrollable={false}>
      <View className="px-4 p-2 bg-white">
        <IncidentSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </View>
      <IncidentMetrics incidents={displayedIncidents} />
      <View className="flex-1">
        <IncidentList
          incidents={displayedIncidents}
          isLoading={isLoading}
          error={error}
          onRefresh={refetch}
        />
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default IncidentsScreen;
