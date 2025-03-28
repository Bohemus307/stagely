import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useAuth0 } from "react-native-auth0";

export const useGetUserById = (userId: string) => {
  // Get getCredentials from useAuth0, and the rest from useAuthUser unless we add getCredentials to the useAuthUser hook
  const { getCredentials } = useAuth0();
  const { isLoading: authLoading, error: authError } = useAuthUser();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!userId) {
        throw new Error("User ID not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(`https://${apiUrl}/users/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        }
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!apiUrl && !!userId,
  });

  return {
    user,
    isLoading: authLoading || userLoading,
    error: authError || userError,
    refetch,
  };
};
