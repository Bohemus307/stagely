// hooks/messaging/useConversations.ts
import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

export const useGetConversations = () => {
  const { getCredentials } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Fetch conversations from the backend
      const response = await fetch(
        `https://${apiUrl}/messaging/conversations`,
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
    enabled: !!apiUrl,
  });

  return {
    conversations: data?.conversations || [],
    isLoading,
    error,
    refetch,
  };
};

export const useGetConversation = (conversationId: string) => {
  const { getCredentials } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Fetch conversation from the backend
      const response = await fetch(
        `https://${apiUrl}/messaging/conversations/${conversationId}`,
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
    conversation: data?.conversation,
    isLoading,
    error,
    refetch,
  };
};

export const useGetUnreadCount = () => {
  const { getCredentials } = useAuth0();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Fetch unread count from the backend
      const response = await fetch(`https://${apiUrl}/messaging/unread-count`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!apiUrl,
  });

  return {
    unreadCount: data?.unreadCount || 0,
    conversationsWithUnread: data?.conversationsWithUnread || [],
    isLoading,
    error,
    refetch,
  };
};
