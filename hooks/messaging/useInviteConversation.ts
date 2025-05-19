// hooks/messaging/useInviteConversation.ts
import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

interface InviteConversationParams {
  email: string;
  initialMessage?: string;
}

// Define a specific interface for the request body
interface InviteRequestBody {
  userId: number;
  email: string;
  initialMessage?: string; // Make initialMessage optional
}

export const useInviteConversation = () => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const queryClient = useQueryClient();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useMutation({
    mutationFn: async (params: InviteConversationParams) => {
      console.log(`Starting invitation for ${params.email}`);

      if (!apiUrl) {
        console.error("API URL not available");
        throw new Error("API URL not available");
      }

      console.log(`Using API URL: ${apiUrl}`);

      if (!backendUser || !backendUser.id) {
        console.error("Backend user ID not available");
        throw new Error("Backend user ID not available, please login again");
      }

      console.log(`Using backend user ID: ${backendUser.id}`);

      // Get the access token
      try {
        const credentials = await getCredentials();

        if (!credentials?.accessToken) {
          console.error("Access token not available");
          throw new Error("Access token not available");
        }

        console.log(
          `Got access token (first 10 chars): ${credentials.accessToken.substring(0, 10)}...`,
        );

        // Create the request body with explicit typing
        const requestBody: InviteRequestBody = {
          userId: backendUser.id,
          email: params.email,
        };

        // Only add initialMessage if it exists
        if (params.initialMessage) {
          requestBody.initialMessage = params.initialMessage;
        }

        console.log(`Request body: ${JSON.stringify(requestBody)}`);

        // Invite user and create conversation
        const endpoint = `https://${apiUrl}/messaging/invite-conversation`;
        console.log(`Making request to: ${endpoint}`);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        console.log(`Response status: ${response.status}`);

        // Log the full response for debugging
        const responseText = await response.text();
        console.log(`Response body: ${responseText}`);

        if (!response.ok) {
          console.error(`Error response: ${responseText}`);
          throw new Error(`API error: ${response.status} - ${responseText}`);
        }

        // Parse the response if it succeeded
        try {
          return JSON.parse(responseText);
        } catch (e) {
          console.error("Error parsing response:", e);
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error in invite conversation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Invitation successful:", data);
      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Invitation failed:", error);
    },
  });
};
