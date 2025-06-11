// hooks/messaging/useInviteConversation.ts - All error handling inlined
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

  // Helper function to show success alerts
  const showSuccessAlert = (email: string, isExistingUser: boolean = false) => {
    const message = isExistingUser
      ? `${email} is already a user and can start conversations with you immediately.`
      : `An invitation has been sent to ${email}. They will receive an email with instructions to join.`;

    Alert.alert("Invitation Sent", message, [{ text: "OK" }]);
  };

  // Helper function to handle different types of errors
  const handleInviteError = (error: Error, email: string) => {
    const errorMessage = error.message.toLowerCase();

    // Handle duplicate email error
    if (
      errorMessage.includes("unique constraint failed") &&
      errorMessage.includes("email")
    ) {
      Alert.alert(
        "User Already Invited",
        `The email "${email}" has already been invited or is already registered.\n\nCheck if they already have an account or previous invitation.`,
        [
          {
            text: "Resend Invitation",
            onPress: async () => {
              try {
                console.log("Resending invitation for:", email);

                const credentials = await getCredentials();
                if (!credentials?.accessToken) {
                  throw new Error("Access token not available");
                }

                const resendResponse = await fetch(
                  `https://${apiUrl}/users/resend-invitation`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${credentials.accessToken}`,
                    },
                    body: JSON.stringify({
                      email: email,
                      userId: backendUser?.id,
                    }),
                  },
                );

                const resendResponseText = await resendResponse.text();
                console.log("Resend response:", resendResponseText);

                if (resendResponse.ok) {
                  showSuccessAlert(email, false);
                  queryClient.invalidateQueries({
                    queryKey: ["conversations"],
                  });
                } else {
                  let errorMessage = "Failed to resend invitation";
                  try {
                    const errorData = JSON.parse(resendResponseText);
                    errorMessage = errorData.error || errorMessage;
                  } catch (e) {
                    // Use default message
                  }

                  Alert.alert("Resend Failed", errorMessage);
                }
              } catch (error: any) {
                console.error("Resend failed:", error);
                Alert.alert(
                  "Resend Failed",
                  error.message || "Failed to resend invitation",
                );
              }
            },
          },
          { text: "OK", style: "default" },
        ],
      );
      return;
    }

    // Handle invalid email errors
    if (
      errorMessage.includes("invalid email") ||
      errorMessage.includes("email format")
    ) {
      Alert.alert(
        "Invalid Email Address",
        `"${email}" is not a valid email address.\n\nPlease check the email address and try again.`,
        [{ text: "OK" }],
      );
      return;
    }

    // Handle authentication errors
    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("access token")
    ) {
      Alert.alert(
        "Authentication Required",
        "Your session has expired.\n\nPlease log out and log back in to continue.",
        [
          {
            text: "Log Out",
            style: "destructive",
            onPress: () => {
              console.log("User should be logged out");
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }

    // Handle permission errors
    if (
      errorMessage.includes("forbidden") ||
      errorMessage.includes("permission") ||
      errorMessage.includes("not authorized")
    ) {
      Alert.alert(
        "Permission Denied",
        "You don't have permission to invite users.\n\nContact your administrator to get invitation permissions.",
        [{ text: "OK" }],
      );
      return;
    }

    // Handle rate limit errors
    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("429")
    ) {
      Alert.alert(
        "Rate Limit Exceeded",
        "Too many invitation attempts.\n\nPlease wait a few minutes before trying again.",
        [{ text: "OK" }],
      );
      return;
    }

    // Handle network errors
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("fetch")
    ) {
      Alert.alert(
        "Connection Error",
        "Network connection error.\n\nCheck your internet connection and try again.",
        [
          {
            text: "Retry",
            onPress: () => {
              // Retry the invitation
              mutate({ email });
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }

    // Default error handling
    Alert.alert(
      "Invitation Failed",
      `An unexpected error occurred: ${error.message}\n\nPlease try again or contact support if the problem persists.`,
      [{ text: "OK" }],
    );
  };

  const mutation = useMutation({
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
        userId: backendUser.id,
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
        // Try to parse error response for better error messages
        let errorMessage = responseText;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || responseText;
        } catch (parseError) {
          // If parsing fails, use the raw response text
        }

        throw new Error(errorMessage);
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

      // Return a standardized response
      return {
        success: true,
        user: inviteData.user,
        conversation: {},
        message: undefined,
      };
    },
    onSuccess: (data, variables) => {
      console.log("Invitation sent successfully");

      // Show success message based on user type
      const isExistingUser = data.user.isPlaceholder === false;
      showSuccessAlert(variables.email, isExistingUser);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error, variables) => {
      console.error("Invitation failed:", error);

      // Handle the error with appropriate UI
      handleInviteError(error, variables.email);
    },
  });

  const { mutate } = mutation;

  return mutation;
};
