import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

export const usePreviouslyMessagedUsers = (
  search: string = "",
  enabled: boolean = true,
) => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useQuery({
    queryKey: ["previouslyMessagedUsers", backendUser?.id, search],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }
      if (!backendUser?.id) {
        throw new Error("User ID not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const params = new URLSearchParams({
        userId: backendUser.id.toString(),
        excludeInvited: "true",
        limit: "20",
      });

      if (search && search.trim().length >= 2) {
        params.append("search", search.trim());
      }

      const response = await fetch(
        `https://${apiUrl}/users/previously-messaged?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching previously messaged users:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    },
    enabled: enabled && !!apiUrl && !!backendUser?.id && search.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};
