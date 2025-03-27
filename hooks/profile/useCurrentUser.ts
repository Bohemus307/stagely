import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

export const useCurrentUser = () => {
  const { user: auth0User, getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch,
  } = useQuery({
    queryKey: ["currentUser", auth0User?.sub],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!auth0User?.sub) {
        throw new Error("Auth0 user ID not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const queryParams = new URLSearchParams();
      queryParams.append("query", auth0User.email || "");
      queryParams.append("limit", "1");

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

      const searchResults = await response.json();

      return searchResults.length > 0 ? searchResults[0] : null;
    },
    enabled: !!apiUrl && !!auth0User?.sub && !!auth0User?.email,
  });

  return {
    auth0User,
    user,
    isLoading: isLoading || userLoading,
    error: error || userError,
    refetch,
  };
};
