import { useState } from "react";
import { View } from "react-native";
import IncidentSearch from "@/components/incidents/search";
import IncidentList from "@/components/incidents/list";
import IncidentMetrics from "@/components/incidents/details/IncidentMetrics";
import { useLocalSearchParams } from "expo-router";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import { useGetIncidents } from "@/hooks/incidents/useGetIncidents";

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
      {incidents && !isLoading && <IncidentMetrics incidents={incidents} />}
      <View className="flex-1">
        {incidents && !isLoading && (
          <IncidentList
            incidents={incidents}
            isLoading={isLoading}
            error={error}
            onRefresh={refetch}
          />
        )}
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default IncidentsScreen;
