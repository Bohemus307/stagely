import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

/**
 * Custom hook to get a single property by ID
 */
export const useGetProperty = (
  propertyId: string,
  p0: { enabled: boolean },
) => {
  const { getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Query to fetch a single property from backend
  const {
    data: property,
    isLoading: propertyLoading,
    error: propertyError,
    refetch,
  } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Fetch property from the backend
      const response = await fetch(
        `https://${apiUrl}/properties/${propertyId}`,
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
    enabled: !!apiUrl && !!propertyId,
  });

  return {
    property,
    isLoading: isLoading || propertyLoading,
    error: error || propertyError,
    refetch,
  };
};
