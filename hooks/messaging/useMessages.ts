// hooks/messaging/useMessages.ts
import { useAuth0 } from "react-native-auth0";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

export const useGetMessages = (conversationId: string, limit = 20) => {
  const { getCredentials } = useAuth0();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Fetch messages from the backend
      const response = await fetch(
        `https://${apiUrl}/messaging/conversations/${conversationId}/messages?limit=${limit}`,
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
    enabled: !!apiUrl && !!conversationId,
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
    mutationFn: async (messageText: string) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Send message to the backend
      const response = await fetch(
        `https://${apiUrl}/messaging/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify({ text: messageText }),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch messages after sending a new message
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
    mutationFn: async (messageIds: string[]) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
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
          body: JSON.stringify({ messageIds }),
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch conversations and unread count
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
};
