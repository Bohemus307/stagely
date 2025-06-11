import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

interface CheckInvitationResult {
  valid: boolean;
  email: string | null;
}

export const useCheckInvitation = (token: string | null) => {
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useQuery<CheckInvitationResult>({
    queryKey: ["checkInvitation", token],
    queryFn: async () => {
      if (!apiUrl || !token) {
        throw new Error("API URL or token not available");
      }

      console.log("Checking invitation token:", token.substring(0, 8) + "...");

      const response = await fetch(
        `https://${apiUrl}/users/check-invitation?token=${encodeURIComponent(token)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to check invitation: ${response.status}`);
      }

      const result = await response.json();
      console.log("Invitation check result:", result);

      return result;
    },
    enabled: !!token && !!apiUrl,
  });
};
