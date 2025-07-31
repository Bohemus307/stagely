import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

export const useGetConversation = (conversationId: string) => {
  const { getCredentials } = useAuth0();
  const { backendUser, isLoading: isLoadingUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversation", conversationId, backendUser?.id],
    queryFn: async () => {
      console.log("🔄 Starting single conversation fetch...");

      if (!apiUrl) {
        console.error("❌ API URL not available");
        throw new Error("API URL not available");
      }

      if (!backendUser?.id) {
        console.error("❌ Backend user ID not available");
        throw new Error("User ID not available");
      }

      if (!conversationId) {
        console.error("❌ Conversation ID not available");
        throw new Error("Conversation ID not available");
      }

      console.log("🔐 Getting credentials...");
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        console.error("❌ Access token not available");
        throw new Error("Access token not available");
      }

      console.log("✅ Credentials obtained, making API call...");
      const fullUrl = `https://${apiUrl}/messaging/conversations/${conversationId}?userId=${backendUser.id}`;
      console.log("📡 Full API URL:", fullUrl);

      const response = await fetch(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: response.url,
        });

        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const conversationData = await response.json();

      return conversationData;
    },
    enabled:
      !!apiUrl && !!backendUser?.id && !!conversationId && !isLoadingUser,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 or 404 errors
      if (error.message.includes("401") || error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  return {
    conversation: data?.conversation || null,
    isLoading: isLoading || isLoadingUser,
    error,
    refetch,
  };
};
