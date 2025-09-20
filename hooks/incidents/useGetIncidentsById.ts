import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuth0 } from "react-native-auth0";

export const useGetIncidentById = (incidentId: string) => {
  const {
    getCredentials,
    isLoading: authLoading,
    error: authError,
  } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data: incident,
    isLoading: incidentLoading,
    error: incidentError,
    refetch,
  } = useQuery({
    queryKey: ["incident", incidentId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL Not Available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/properties/incidents/${incidentId}`,
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
    enabled: !!apiUrl && !!incidentId,
  });

  return {
    incident,
    isLoading: authLoading || incidentLoading,
    error: authError || incidentError,
    refetch,
  };
};
