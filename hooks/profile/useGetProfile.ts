import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { User } from "@/lib/@types/properties";

export const useGetProfile = (userId: string) => {
  const {
    getCredentials,
    isLoading: authLoading,
    error: authError,
  } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch,
  } = useQuery<User, Error>({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access Token not available");
      }

      const response = await fetch(`https://${apiUrl}/users/${userId}`, {
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
    enabled: !!apiUrl && !!userId,
  });

  return {
    user,
    isLoading: authLoading || userLoading,
    error: authError || userError,
    refetch,
  };
};
