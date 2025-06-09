// hooks/messaging/useInviteConversation.ts
import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

interface InviteConversationParams {
  email: string;
  initialMessage?: string;
}

export const useInviteConversation = () => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const queryClient = useQueryClient();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useMutation({
    mutationFn: async (params: InviteConversationParams) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!backendUser || !backendUser.id) {
        throw new Error("Backend user ID not available, please login again");
      }

      console.log("Starting invite process with params:", {
        email: params.email,
        hasInitialMessage: !!params.initialMessage,
        backendUserId: backendUser.id,
        apiUrl,
      });

      // Get the access token
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Send invitation to the user
      const inviteEndpoint = `https://${apiUrl}/users/invite`;
      console.log(`Inviting user via: ${inviteEndpoint}`);

      const inviteRequestBody = {
        email: params.email,
      };

      console.log("Invite request body:", JSON.stringify(inviteRequestBody));

      const inviteResponse = await fetch(inviteEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(inviteRequestBody),
      });

      console.log("Invite response status:", inviteResponse.status);
      const responseText = await inviteResponse.text();
      console.log("Invite response text:", responseText);

      if (!inviteResponse.ok) {
        throw new Error(
          `API error: ${inviteResponse.status} - ${responseText}`,
        );
      }

      // Parse the response
      const inviteData = JSON.parse(responseText);

      if (!inviteData.success || !inviteData.user || !inviteData.user.id) {
        throw new Error(
          "Failed to create or find invited user: " +
            JSON.stringify(inviteData),
        );
      }

      console.log("Successfully invited user:", inviteData.user.id);

      // Check if the user is a placeholder (needs to accept invitation)
      const isPlaceholder = inviteData.user.isPlaceholder === true;

      // For placeholder users, just return the invitation data
      // For non-placeholder users (already existing), we could create a conversation
      // but that's handled separately in handleUserSelect

      // Return a standardized response
      return {
        success: true,
        user: inviteData.user,
        // Return empty objects for conversation and message
        // since we can't create a conversation until the user accepts
        conversation: {},
        message: undefined,
      };
    },
    onSuccess: (data) => {
      console.log("Invitation sent successfully");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Invitation failed:", error);
    },
  });
};
