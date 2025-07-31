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

  // Helper function to try resending invitation
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

  // Helper function to search for existing user by email
  const findUserByEmail = async (
    email: string,
    accessToken: string,
  ): Promise<any | null> => {
    try {
      // Try to search for the user
      const searchResponse = await fetch(
        `https://${apiUrl}/users/search?query=${encodeURIComponent(email)}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();

        // Look for exact email match (case insensitive) - INCLUDE placeholder users
        if (searchResults && searchResults.length > 0) {
          const exactMatch = searchResults.find(
            (user: any) =>
              user.email && user.email.toLowerCase() === email.toLowerCase(),
          );

          if (exactMatch) {
            return exactMatch;
          }
        } else if (searchResults.users && searchResults.users.length > 0) {
          const exactMatch = searchResults.users.find(
            (user: any) =>
              user.email && user.email.toLowerCase() === email.toLowerCase(),
          );

          if (exactMatch) {
            return exactMatch;
          }
        } else {
        }
      } else {
        const errorText = await searchResponse.text();
        console.log("Search request failed:", errorText);
      }

      return null;
    } catch (error) {
      console.log("Could not search for existing user:", error);
      return null;
    }
  };

  // Helper function to create conversation with existing user
  const createConversationWithUser = async (
    targetUserId: number,
    initialMessage?: string,
    accessToken?: string,
  ) => {
    const conversationResponse = await fetch(
      `https://${apiUrl}/messaging/conversations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: backendUser!.id,
          participants: [targetUserId],
          initialMessage: initialMessage,
        }),
      },
    );

    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text();
      throw new Error(errorText || "Failed to create conversation");
    }

    return await conversationResponse.json();
  };

  // Helper function to send invitation to new user
  const sendInvitationToNewUser = async (
    email: string,
    accessToken: string,
  ) => {
    const inviteResponse = await fetch(`https://${apiUrl}/users/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email: email,
        userId: backendUser!.id,
      }),
    });

    if (!inviteResponse.ok) {
      const errorText = await inviteResponse.text();
      let errorMessage = errorText;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorText;
      } catch (parseError) {
        // Use raw text if parsing fails
      }

      throw new Error(errorMessage);
    }

    return await inviteResponse.json();
  };

  const mutation = useMutation({
    mutationFn: async (params: InviteConversationParams) => {
      // Validate required data
      if (!backendUser?.id) {
        throw new Error("User information not available. Please login again.");
      }

      // Get the access token
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Check if user already exists
      const existingUser = await findUserByEmail(
        params.email,
        credentials.accessToken,
      );

      if (existingUser) {
        // Check if this is a placeholder user (invited but not accepted)
        if (existingUser.isPlaceholder) {
          // User was already invited
          Alert.alert(
            "Already Invited",
            `${params.email} has already been invited. They need to check their email and accept the invitation to start chatting.`,
            [
              {
                text: "OK",
                style: "default",
              },
              {
                text: "Resend Invitation",
                onPress: async () => {
                  try {
                    await tryResendInvitation(
                      params.email,
                      credentials.accessToken,
                    );
                  } catch (error) {
                    console.error("Resend failed:", error);
                    Alert.alert(
                      "Resend Failed",
                      "Could not resend invitation.",
                    );
                  }
                },
              },
            ],
          );

          // Don't proceed with conversation creation or new invitation
          throw new Error("user_already_invited");
        } else {
          // User exists and is active create conversation directly

          const conversationResult = await createConversationWithUser(
            existingUser.id,
            params.initialMessage,
            credentials.accessToken,
          );

          return {
            success: true,
            user: {
              id: existingUser.id,
              email: existingUser.email,
              isPlaceholder: false,
            },
            conversation: conversationResult.conversation || conversationResult,
            message: conversationResult.message,
            isExistingUser: true,
          };
        }
      } else {
        // User doesn't exist - send invitation

        const inviteResult = await sendInvitationToNewUser(
          params.email,
          credentials.accessToken,
        );

        return {
          success: true,
          user: inviteResult.user,
          conversation: {},
          message: undefined,
          isExistingUser: false,
        };
      }
    },
    onSuccess: (data, variables) => {
      console.log("Process completed successfully");

      if (data.isExistingUser) {
        // User exists
        Alert.alert(
          "Conversation Started",
          `${variables.email} is already a user. You can start chatting immediately!`,
          [{ text: "OK" }],
        );
      } else {
        // New invitation sent
        Alert.alert(
          "Invitation Sent",
          `An invitation has been sent to ${variables.email}. They will receive an email with instructions to join.`,
          [{ text: "OK" }],
        );
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: Error, variables) => {
      console.error("Process failed:", error);

      // Don't show error for already invited users
      if (error.message === "user_already_invited") {
        return;
      }

      const errorMessage = error.message.toLowerCase();

      // Handle specific errors
      if (
        errorMessage.includes("unique constraint failed") &&
        errorMessage.includes("email")
      ) {
        Alert.alert(
          "User Already Invited",
          `The email "${variables.email}" has already been invited. They may need to check their email and accept the invitation.`,
          [{ text: "OK" }],
        );
      } else if (errorMessage.includes("participants not found")) {
        Alert.alert(
          "User Not Found",
          `Could not find or create conversation with ${variables.email}. Please try again.`,
          [{ text: "OK" }],
        );
      } else {
        Alert.alert("Error", `Failed to process request: ${error.message}`, [
          { text: "OK" },
        ]);
      }
    },
  });

  return mutation;
};
