import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

type IncidentFilterParams = {
  page?: number;
  limit?: number;
  propertyId?: number;
  status?: "Open" | "In_Progress" | "Resolved" | "Closed";
  severity?: "Low" | "Medium" | "High" | "Critical";
  spaceType?: string;
  incidentType?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: "reportedAt" | "resolvedAt" | "severity" | "status";
  sortOrder?: "asc" | "desc";
};

export const useGetIncidents = ({
  page = 1,
  limit = 10,
  propertyId,
  status,
  severity,
  spaceType,
  incidentType,
  fromDate,
  toDate,
  sortBy = "reportedAt",
  sortOrder = "desc",
}: IncidentFilterParams = {}) => {
  const {
    getCredentials,
    isLoading: authLoading,
    error: authError,
  } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data,
    isLoading: incidentsLoading,
    error: incidentsError,
    refetch,
  } = useQuery({
    queryKey: [
      "incidents",
      page,
      limit,
      propertyId,
      status,
      severity,
      spaceType,
      incidentType,
      fromDate,
      toDate,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      if (propertyId) {
        queryParams.append("propertyId", propertyId.toString());
      }

      if (status) {
        queryParams.append("status", status);
      }

      if (severity) {
        queryParams.append("severity", severity);
      }

      if (spaceType) {
        queryParams.append("spaceType", spaceType);
      }

      if (incidentType) {
        queryParams.append("incidentType", incidentType);
      }

      if (fromDate) {
        queryParams.append("fromDate", fromDate);
      }

      if (toDate) {
        queryParams.append("toDate", toDate);
      }

      if (sortBy) {
        queryParams.append("sortBy", sortBy);
      }

      if (sortOrder) {
        queryParams.append("sortOrder", sortOrder);
      }

      const response = await fetch(
        `https://${apiUrl}/properties/incidents?${queryParams.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!apiUrl,
  });

  return {
    incidents: data?.data || [],
    meta: data?.meta,
    isLoading: authLoading || incidentsLoading,
    error: authError || incidentsError,
    refetch,
  };
};
