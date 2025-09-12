import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { User } from "@/lib/@types/properties";

/**
 * Custom hook to fetch authenticated user data from Auth0 and then get
 * additional user details from the backend API
 */
export const useAuthUser = () => {
  const { user, getCredentials, isLoading, error } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const {
    data: backendUser,
    isLoading: backendLoading,
    error: backendError,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["user", user?.email],
    queryFn: async (): Promise<User | null> => {
      if (!user?.email || !apiUrl) {
        throw new Error("User email or API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/users/search?query=${encodeURIComponent(user.email)}&limit=1`,
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

      const users = await response.json();
      return users[0] || null;
    },
    enabled: !!user?.email && !!apiUrl,
  });

  // Helper function to check if user is placeholder
  const isPlaceholderUser = (backendUser as any)?.isPlaceholder === true;

  return {
    auth0User: user,
    backendUser,
    isLoading: isLoading || backendLoading,
    error: error || backendError,
    refetch,
    isPlaceholderUser,
  };
};
