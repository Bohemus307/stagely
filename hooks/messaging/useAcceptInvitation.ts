// hooks/messaging/useAcceptInvitation.ts
import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

interface AcceptInvitationParams {
  token: string;
}

export const useAcceptInvitation = () => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const queryClient = useQueryClient();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useMutation({
    mutationFn: async (params: AcceptInvitationParams) => {
      console.log("=== ACCEPT INVITATION DEBUG ===");
      console.log("1. API URL:", apiUrl);
      console.log("2. Backend user:", JSON.stringify(backendUser, null, 2));
      console.log("3. Token:", params.token.substring(0, 8) + "...");

      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!backendUser || !backendUser.id) {
        throw new Error("Backend user ID not available, please login again");
      }

      // Get the access token
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      console.log("4. Making accept invitation request...");

      // Accept the invitation
      const response = await fetch(
        `https://${apiUrl}/users/accept-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify({
            userId: backendUser.id,
            token: params.token,
          }),
        },
      );

      console.log("5. Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("6. Error response:", errorText);
        throw new Error(
          `Failed to accept invitation: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("7. Success response:", JSON.stringify(result, null, 2));

      return result;
    },
    onSuccess: (data) => {
      console.log("Invitation accepted successfully");
      // Invalidate user queries to refetch updated user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Failed to accept invitation:", error);
    },
  });
};
