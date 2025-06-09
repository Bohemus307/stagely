// hooks/messaging/useConversations.ts
import { useAuth0 } from "react-native-auth0";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useAuthUser } from "@/hooks/useAuthUser";

export const useGetConversations = (limit = 20) => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }
      if (!backendUser?.id) {
        throw new Error("User ID not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Fetch conversations from the backend
      const response = await fetch(
        `https://${apiUrl}/messaging/conversations?userId=${backendUser.id}&limit=${limit}`,
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
    enabled: !!apiUrl && !!backendUser?.id,
  });

  // Process the conversation data to include participant names
  const processedConversations =
    data?.conversations?.map((conv: any) => {
      // Find the other participants (who aren't the current user)
      const otherParticipants =
        conv.participants?.filter((p: number) => p !== backendUser?.id) || [];

      // We don't have participants names directly from the backend
      // You'll need to fetch user info separately or use a lookup approach

      return {
        ...conv,
        // This is just a placeholder, you'll need to implement participant name resolution
        participantNames: otherParticipants.map(() => "User"),
        participantAvatars: otherParticipants.map(() => null),
      };
    }) || [];

  return {
    conversations: processedConversations,
    isLoading,
    error,
    refetch,
  };
};

export const useGetConversation = (conversationId: string) => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }
      if (!backendUser?.id) {
        throw new Error("User ID not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Fetch conversation from the backend
      const response = await fetch(
        `https://${apiUrl}/messaging/conversations/${conversationId}?userId=${backendUser.id}`,
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

  // Process conversation data to include participant names
  const processedConversation = data?.conversation
    ? {
        ...data.conversation,
        // This is a placeholder for participant name resolution
        participantNames: (data.conversation.participants || [])
          .filter((p: number) => p !== backendUser?.id)
          .map(() => "User"),
        participantAvatars: (data.conversation.participants || [])
          .filter((p: number) => p !== backendUser?.id)
          .map(() => null),
      }
    : null;

  return {
    conversation: processedConversation,
    isLoading,
    error,
    refetch,
  };
};

export const useGetUnreadCount = () => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }
      if (!backendUser?.id) {
        throw new Error("User ID not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Fetch unread count from the backend
      const response = await fetch(
        `https://${apiUrl}/messaging/unread-count?userId=${backendUser.id}`,
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
    enabled: !!apiUrl && !!backendUser?.id,
  });

  return {
    unreadCount: data?.unreadCount || 0,
    conversationsWithUnread: data?.conversationsWithUnread || [],
    isLoading,
    error,
    refetch,
  };
};
