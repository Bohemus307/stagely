import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Alert } from "react-native";
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

  // Helper function to resend invitation (keep this for the Resend button)
  const tryResendInvitation = async (email: string, accessToken: string) => {
    const resendResponse = await fetch(
      `https://${apiUrl}/users/resend-invitation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: email,
        }),
      },
    );

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      throw new Error(errorText || "Failed to resend invitation");
    }

    const result = await resendResponse.json();
    if (result.success) {
      Alert.alert(
        "Invitation Resent",
        `Invitation has been resent to ${email}`,
      );
    } else {
      throw new Error(result.error || "Failed to resend invitation");
    }
  };

  const mutation = useMutation({
    mutationFn: async (params: InviteConversationParams) => {
      // Validate required data
      if (!backendUser?.id) {
        throw new Error("User information not available. Please login again.");
      }

      if (!apiUrl) {
        throw new Error("API URL not configured");
      }

      // Get the access token
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      console.log("Calling unified invite endpoint:", {
        email: params.email,
        hasMessage: !!params.initialMessage,
      });

      // Single API call to the unified endpoint
      const response = await fetch(
        `https://${apiUrl}/messaging/invite-and-create-conversation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify({
            userId: backendUser.id,
            email: params.email,
            initialMessage: params.initialMessage || undefined,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = errorText;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorText;
        } catch (parseError) {
          // Use raw text if parsing fails
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Unified invite response:", result);

      // Store credentials for potential resend
      result._credentials = credentials;
      result._email = params.email;

      return result;
    },
    onSuccess: (data, variables) => {
      console.log("Invitation process completed successfully");

      const {
        isExistingUser,
        isAlreadyInvited,
        isNewInvitation,
        _credentials,
        _email,
      } = data;

      // Handle different scenarios with appropriate alerts
      if (isExistingUser) {
        // User already has an active account
        Alert.alert(
          "Conversation Started",
          `${variables.email} is already a user. You can start chatting immediately!`,
          [{ text: "OK" }],
        );
      } else if (isAlreadyInvited && !isNewInvitation) {
        // User was already invited before - show option to resend
        Alert.alert(
          "Already Invited",
          `${variables.email} has already been invited. They need to check their email and accept the invitation.`,
          [
            {
              text: "OK",
              style: "default",
            },
            {
              text: "Resend Invitation",
              onPress: async () => {
                try {
                  await tryResendInvitation(_email, _credentials.accessToken);
                } catch (error) {
                  console.error("Resend failed:", error);
                  Alert.alert(
                    "Resend Failed",
                    "Could not resend invitation. Please try again.",
                  );
                }
              },
            },
          ],
        );
      } else if (isNewInvitation) {
        // New invitation sent
        Alert.alert(
          "Invitation Sent",
          `An invitation has been sent to ${variables.email}. They will receive an email with instructions to join.`,
          [{ text: "OK" }],
        );
      }

      // Invalidate queries to refresh conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error, variables) => {
      console.error("Invitation process failed:", error);

      // Show user-friendly error message
      Alert.alert("Error", `Failed to process invitation: ${error.message}`, [
        { text: "OK" },
      ]);
    },
  });

  return mutation;
};
