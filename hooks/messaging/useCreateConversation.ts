// hooks/messaging/useCreateConversation.ts
import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

interface CreateConversationParams {
  participants: number[];
  type: "general";
  initialMessage?: string;
}

export const useCreateConversation = () => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useMutation({
    mutationFn: async (params: CreateConversationParams) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Create conversation
      const response = await fetch(
        `https://${apiUrl}/messaging/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
