import { useMemo, useEffect } from "react";
import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { FlatList, ActivityIndicator, View } from "react-native";
import MessageCard from "./MessageCard";
import { Message } from "@/components/message/data/messages";
import { filterMessages } from "../lib/utils/messageHelpers";
import {
  useGetConversations,
  useGetUnreadCount,
} from "@/hooks/messaging/useConversations";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";

// Define proper types for your conversations
interface Conversation {
  conversationId: string;
  participants?: number[];
  participantNames?: string[];
  participantAvatars?: string[];
  lastMessageText?: string;
  lastMessageTime?: number;
  unreadCount?: Record<string, number>;
}

export interface MessageListProps {
  searchQuery?: string;
  statusFilter?: string | null;
}

const MessagesList: React.FC<MessageListProps> = ({
  searchQuery = "",
  statusFilter = null,
}) => {
  const { backendUser } = useAuthUser();
  const { conversations, isLoading, error, refetch } = useGetConversations();
  const { unreadCount } = useGetUnreadCount();

  // Add debug logging for development
  useEffect(() => {
    if (conversations && conversations.length > 0) {
      console.log("Sample conversation structure:", conversations[0]);
    }
  }, [conversations]);

  // Convert conversations from API to message format
  const formattedMessages = useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return [];
    }

    return conversations.map((conv: Conversation) => {
      // Safely access participants array
      const participants = conv.participants || [];

      // Find other participant's ID
      const otherParticipantId = participants.find(
        (p) => p !== backendUser?.id,
      );

      return {
        id: conv.conversationId,
        user: {
          id: otherParticipantId?.toString() || "unknown",
          name: conv.participantNames?.[0] || "Unknown",
          avatar: conv.participantAvatars?.[0],
        },
        lastMessage: conv.lastMessageText || "Start a conversation...",
        timestamp: conv.lastMessageTime
          ? new Date(conv.lastMessageTime).toISOString()
          : new Date().toISOString(),
        unread:
          conv.unreadCount &&
          backendUser?.id &&
          conv.unreadCount[backendUser.id.toString()] > 0,
      };
    });
  }, [conversations, backendUser?.id]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return filterMessages(formattedMessages, searchQuery, statusFilter);
  }, [formattedMessages, searchQuery, statusFilter]);

  const handleMessagePress = (message: Message) => {
    router.push({
      pathname: "/(tabs)/(messages)/[conversation]",
      params: {
        conversation: message.id,
        userId: message.user.id,
      },
    });
  };

  const renderEmpty = () => {
    if (error) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <IconSymbol
            name="exclamationmark.triangle"
            size={48}
            color="#ef4444"
          />
          <ThemedText className="text-center mt-4 text-gray-700">
            Error loading messages. Pull down to retry.
          </ThemedText>
        </Box>
      );
    }

    return (
      <Box className="flex-1 justify-center items-center p-8">
        <IconSymbol name="message.fill" size={48} color="#9CA3AF" />
        <ThemedText className="text-center mt-4 text-gray-500">
          {searchQuery || statusFilter
            ? "No messages match your search"
            : "No messages yet. Start a conversation!"}
        </ThemedText>
      </Box>
    );
  };

  const handleNewMessage = () => {
    router.push("/(tabs)/(messages)/new");
  };

  if ((isLoading && formattedMessages.length === 0) || !backendUser) {
    return (
      <Box className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0056b3" />
      </Box>
    );
  }

  return (
    <View className="flex-1 relative">
      <Box className="flex-1 bg-primary-50">
        <FlatList
          data={filteredMessages}
          renderItem={({ item }) => (
            <MessageCard message={item} onPress={handleMessagePress} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            flexGrow: filteredMessages.length ? 0 : 1,
          }}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={renderEmpty}
        />
      </Box>

      <View className="absolute right-4 bottom-4 z-10">
        <Button
          onPress={handleNewMessage}
          className="bg-primary-500 rounded-full w-14 h-14 items-center justify-center shadow-md"
        >
          <IconSymbol name="plus" size={24} color="white" />
          {unreadCount > 0 && (
            <Box className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <ThemedText className="text-xs text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </ThemedText>
            </Box>
          )}
        </Button>
      </View>
    </View>
  );
};

export default MessagesList;
