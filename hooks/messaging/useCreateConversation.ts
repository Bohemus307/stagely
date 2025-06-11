import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

interface CreateConversationParams {
  userId: number;
  participants: number[];
  initialMessage?: string;
}

export const useCreateConversation = () => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;
  const { backendUser } = useAuthUser();

  return useMutation({
    mutationFn: async (params: CreateConversationParams) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const requestBody = {
        userId: params.userId,
        participants: params.participants,
        initialMessage: params.initialMessage,
      };

      const url = `https://${apiUrl}/messaging/conversations`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }

        throw new Error(
          errorData.error || `API error: ${response.status} - ${errorText}`,
        );
      }

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Invalid JSON response from server");
      }

      return responseData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
    onError: (error) => {
      console.error("Failed to create conversation:", error);
    },
  });
};
