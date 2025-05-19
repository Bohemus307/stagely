// components/message/list/index.tsx
import { useMemo } from "react";
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

export interface MessageListProps {
  searchQuery?: string;
  statusFilter?: string | null;
}

const MessagesList: React.FC<MessageListProps> = ({
  searchQuery = "",
  statusFilter = null,
}) => {
  const { conversations, isLoading, error, refetch } = useGetConversations();
  const { unreadCount } = useGetUnreadCount();

  // Convert conversations from API to message format using useMemo
  const formattedMessages = useMemo(() => {
    if (!conversations || conversations.length === 0) {
      return [];
    }

    return conversations.map((conv: any) => {
      // Find other participant's ID (the first one that isn't the current user)
      // This assumes the current user is always one of the participants
      const otherParticipantId = conv.participants[0]; // Just take the first participant as the other user

      return {
        id: conv.conversationId,
        user: {
          id: otherParticipantId.toString(),
          name: conv.participantNames?.[0] || "Unknown",
          avatar: conv.participantAvatars?.[0],
        },
        lastMessage: conv.lastMessageText || "Start a conversation...",
        timestamp: conv.lastMessageTime
          ? new Date(conv.lastMessageTime).toISOString()
          : new Date().toISOString(),
        unread: conv.unreadCount && conv.unreadCount["currentUser"] > 0,
      };
    });
  }, [conversations]);

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
    // Show error message only if there's a real error
    // Otherwise, show the "No messages" message
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

  if (isLoading && formattedMessages.length === 0) {
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

      {/* Fab button with improved positioning */}
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
