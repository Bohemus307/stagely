import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

/**
 * Custom hook to search for properties with authentication
 */
export const usePropertySearch = (searchQuery = "", page = 1, limit = 10) => {
  const { getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Query to search properties from backend
  const {
    data: properties,
    isLoading: searchLoading,
    error: searchError,
    refetch,
  } = useQuery({
    queryKey: ["properties", searchQuery, page, limit],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Build the search URL with parameters
      let queryParams = new URLSearchParams();
      if (searchQuery) {
        queryParams.append("query", searchQuery);
      }
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      // Fetch properties from the backend
      const response = await fetch(
        `https://${apiUrl}/properties/search?${queryParams.toString()}`,
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
    properties,
    isLoading: isLoading || searchLoading,
    error: error || searchError,
    refetch,
  };
};
