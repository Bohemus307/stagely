// hooks/messaging/useCreateConversation.ts
import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

interface CreateConversationParams {
  userId: number; // ID of the current user
  participants: number[]; // IDs of other participants
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
      console.log("=== CREATE CONVERSATION HOOK DEBUG ===");
      console.log("API URL:", apiUrl);
      console.log("Input params:", JSON.stringify(params, null, 2));

      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      console.log("Getting credentials...");
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      console.log(
        "Access token obtained, length:",
        credentials.accessToken.length,
      );

      // Prepare request body
      const requestBody = {
        userId: params.userId,
        participants: params.participants,
        initialMessage: params.initialMessage,
      };

      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const url = `https://${apiUrl}/messaging/conversations`;
      console.log("Making request to:", url);

      // Create conversation
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response text:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }

        console.log("Parsed error data:", errorData);
        throw new Error(
          errorData.error || `API error: ${response.status} - ${errorText}`,
        );
      }

      const responseText = await response.text();
      console.log("Success response text:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      console.log(
        "Parsed response data:",
        JSON.stringify(responseData, null, 2),
      );
      console.log("Response data keys:", Object.keys(responseData));

      if (responseData.conversation) {
        console.log(
          "Conversation object keys:",
          Object.keys(responseData.conversation),
        );
      }

      if (responseData.message) {
        console.log("Message object keys:", Object.keys(responseData.message));
      }

      return responseData;
    },
    onSuccess: (data) => {
      console.log("=== MUTATION SUCCESS ===");
      console.log("Mutation success data:", JSON.stringify(data, null, 2));

      // Invalidate and refetch conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
    onError: (error) => {
      console.log("=== MUTATION ERROR ===");
      console.error("Mutation error:", error);
    },
  });
};
