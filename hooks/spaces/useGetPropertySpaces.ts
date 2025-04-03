import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { PropertySpace, SpaceType } from "@/lib/@types/properties";

// Define interface for query parameters
interface PropertySpacesQueryParams {
  spaceType?: SpaceType;
  aiGenerated?: boolean;
  search?: string;
  sortBy?: "createdAt" | "name" | "type";
  sortOrder?: "asc" | "desc";
}

/**
 * Custom hook to get all spaces by property ID with filtering options
 * @param propertyId The ID of the property
 * @param queryParams Optional query parameters for filtering and sorting
 * @returns PropertySpaces data, loading state, error state, and refetch function
 */
export const useGetPropertySpaces = (
  propertyId: string,
  queryParams?: PropertySpacesQueryParams,
) => {
  const { getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Query to fetch property spaces from backend
  const {
    data: propertySpaces,
    isLoading: propertySpacesLoading,
    error: propertySpacesError,
    refetch,
  } = useQuery<PropertySpace[]>({
    queryKey: ["propertySpaces", propertyId, queryParams],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Build URL with query parameters
      const url = new URL(
        `https://${apiUrl}/properties/spaces/property/${propertyId}`,
      );

      // Add query parameters if provided
      if (queryParams) {
        if (queryParams.spaceType) {
          url.searchParams.append("spaceType", queryParams.spaceType);
        }

        if (queryParams.aiGenerated !== undefined) {
          url.searchParams.append(
            "aiGenerated",
            queryParams.aiGenerated.toString(),
          );
        }

        if (queryParams.search) {
          url.searchParams.append("search", queryParams.search);
        }

        if (queryParams.sortBy) {
          url.searchParams.append("sortBy", queryParams.sortBy);
        }

        if (queryParams.sortOrder) {
          url.searchParams.append("sortOrder", queryParams.sortOrder);
        }
      }

      // Fetch property spaces from the backend
      const response = await fetch(url.toString(), {
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
    enabled: !!apiUrl && !!propertyId,
  });

  return {
    propertySpaces,
    isLoading: isLoading || propertySpacesLoading,
    error: error || propertySpacesError,
    refetch,
  };
};
