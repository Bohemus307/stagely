import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

export const useUserSearch = (query: string, limit: number = 5) => {
  const { getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data: users,
    isLoading: searchLoading,
    error: searchError,
    refetch,
  } = useQuery({
    queryKey: ["userSearch", query, limit],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!query) {
        return [];
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      let queryParams = new URLSearchParams();
      queryParams.append("query", query);
      queryParams.append("limit", limit.toString());

      const response = await fetch(
        `https://${apiUrl}/users/search?${queryParams.toString()}`,
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
    enabled: !!apiUrl && !!query,
  });

  return {
    users: users || [],
    isLoading: isLoading || searchLoading,
    error: error || searchError,
    refetch,
  };
};
