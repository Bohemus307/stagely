import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

/**
 * Type definition for property filter parameters
 */
type PropertyFilterParams = {
  page?: number;
  limit?: number;
  status?: "Active" | "Maintenance" | "Archived";
  country?: string;
  city?: string;
  sortBy?: "createdAt" | "updatedAt" | "address";
  sortOrder?: "asc" | "desc";
  search?: string;
};

/**
 * Custom hook to get properties with filtering options
 */
export const useGetProperties = ({
  page = 1,
  limit = 10,
  status,
  country,
  city,
  sortBy = "updatedAt",
  sortOrder = "desc",
  search = "",
}: PropertyFilterParams = {}) => {
  const { getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Query to fetch properties from backend
  const {
    data: properties,
    isLoading: propertiesLoading,
    error: propertiesError,
    refetch,
  } = useQuery({
    queryKey: [
      "properties",
      page,
      limit,
      status,
      country,
      city,
      sortBy,
      sortOrder,
      search,
    ],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Build the URL with query parameters
      let queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      if (status) {
        queryParams.append("status", status);
      }

      if (country) {
        queryParams.append("country", country);
      }

      if (city) {
        queryParams.append("city", city);
      }

      if (sortBy) {
        queryParams.append("sortBy", sortBy);
      }

      if (sortOrder) {
        queryParams.append("sortOrder", sortOrder);
      }

      if (search) {
        queryParams.append("search", search);
      }

      // Fetch properties from the backend
      const response = await fetch(
        `https://${apiUrl}/properties?${queryParams.toString()}`,
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
    isLoading: isLoading || propertiesLoading,
    error: error || propertiesError,
    refetch,
  };
};
