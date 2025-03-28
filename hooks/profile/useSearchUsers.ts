import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

type UserFilterParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "lastName" | "email";
  sortOrder?: "asc" | "desc";
};

export const useGetUsers = ({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
}: UserFilterParams = {}) => {
  const { getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data,
    isLoading: usersLoading,
    error: usersError,
    refetch,
  } = useQuery({
    queryKey: ["users", page, limit, search, sortBy, sortOrder],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("Api URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      let queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      if (search) {
        queryParams.append("search", search);
      }

      if (sortBy) {
        queryParams.append("sortBy", sortBy);
      }

      if (sortOrder) {
        queryParams.append("sortOrder", sortOrder);
      }

      const response = await fetch(
        `https://${apiUrl}/users?${queryParams.toString()}`,
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
    users: data?.data || [],
    meta: data?.meta,
    isLoading: isLoading || usersLoading,
    error: error || usersError,
    refetch,
  };
};
