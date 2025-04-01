import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

export const useGetIncidentStats = (propertyId?: number) => {
  const {
    getCredentials,
    isLoading: authLoading,
    error: authError,
  } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch,
  } = useQuery({
    queryKey: ["incidentStats", propertyId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Build the URL with query parameters
      let url = `https://${apiUrl}/properties/incidents/stats`;
      if (propertyId) {
        url += `?propertyId=${propertyId}`;
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!apiUrl,
  });

  return {
    stats,
    isLoading: authLoading || statsLoading,
    error: authError || statsError,
    refetch,
  };
};
