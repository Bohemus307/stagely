import { useAuth0 } from "react-native-auth0";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import Constants from "expo-constants";

/**
 * Custom hook to search for properties with authentication
 * Returns the API response structure: { data: [], meta: {} }
 *
 * This version works with React Query v4/v5
 */
export const usePropertySearch = (searchQuery = "", page = 1, limit = 10) => {
  const { getCredentials } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Query to search properties from backend
  const {
    data: properties,
    isLoading,
    error,
    refetch,
    isFetching,
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
      const queryParams = new URLSearchParams();

      // Only add query param if there's actual search text
      if (searchQuery.trim()) {
        queryParams.append("query", searchQuery.trim());
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

      // Return the full response structure { data: [], meta: {} }
      return response.json();
    },
    enabled: !!apiUrl,
    // For React Query v5:
    placeholderData: keepPreviousData,
    // For React Query v4, use this instead:
    // keepPreviousData: true,

    // Don't refetch on window focus
    refetchOnWindowFocus: false,
    // Keep the cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  return {
    properties, // This will be { data: [], meta: {} } or undefined
    isLoading,
    isFetching, // This tells you if it's fetching in the background
    error,
    refetch,
  };
};
