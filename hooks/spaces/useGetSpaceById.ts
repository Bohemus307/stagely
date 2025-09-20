import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { PropertySpace } from "@/lib/@types/properties";

/**
 * Custom hook to get a single property space by ID
 * @param spaceId The ID of the property space
 * @returns PropertySpace data, loading state, error state, and refetch function
 */
export const useGetPropertySpace = (spaceId: string) => {
  const { getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Query to fetch property space from backend
  const {
    data: propertySpace,
    isLoading: propertySpaceLoading,
    error: propertySpaceError,
    refetch,
  } = useQuery<PropertySpace>({
    queryKey: ["propertySpace", spaceId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Build URL with space ID
      const url = `https://${apiUrl}/properties/spaces/${spaceId}`;

      // Fetch property space from the backend
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Property space not found");
        }
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!apiUrl && !!spaceId,
  });

  return {
    propertySpace,
    isLoading: isLoading || propertySpaceLoading,
    error: error || propertySpaceError,
    refetch,
  };
};
