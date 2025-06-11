// hooks/messaging/useMessages.ts
import { useAuth0 } from "react-native-auth0";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

interface MarkAsReadParams {
  userId: number;
  messageIds: string[];
}

interface SendMessageParams {
  userId: number;
  text: string;
}

export const useGetMessages = (conversationId: string, limit = 20) => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }
      if (!backendUser?.id) {
        throw new Error("User ID not available");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/messaging/conversations/${conversationId}/messages?userId=${backendUser.id}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!apiUrl && !!conversationId && !!backendUser?.id,
  });

  return {
    messages: data?.messages || [],
    lastKey: data?.lastKey || null,
    isLoading,
    error,
    refetch,
  };
};

export const useSendMessage = (conversationId: string) => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!params.userId) {
        throw new Error("User ID not available");
      }

      if (!params.text || params.text.trim() === "") {
        throw new Error("Message text cannot be empty");
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      const response = await fetch(
        `https://${apiUrl}/messaging/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify({
            userId: params.userId,
            text: params.text,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error sending message:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const messageData = await response.json();
      return messageData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
};

export const useMarkAsRead = (conversationId: string) => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useMutation({
    mutationFn: async (params: MarkAsReadParams) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!params.userId) {
        throw new Error("User ID not available");
      }

      if (!params.messageIds || params.messageIds.length === 0) {
        return { updated: [], failed: [] };
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Mark messages as read
      const response = await fetch(
        `https://${apiUrl}/messaging/conversations/${conversationId}/read`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify({
            userId: params.userId,
            messageIds: params.messageIds,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error marking messages as read:", errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
};
