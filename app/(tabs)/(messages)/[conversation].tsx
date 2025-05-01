import { useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import BackButton from "@/components/BackButton";
import { HStack } from "@/components/ui/hstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Ionicons } from "@expo/vector-icons";
import { useGetConversation } from "@/hooks/messaging/useConversations";
import {
  useGetMessages,
  useSendMessage,
  useMarkAsRead,
} from "@/hooks/messaging/useMessages";
import { ChatMessage } from "@/components/message/data/messages";

// Memoized Message component to prevent unnecessary re-renders
const MessageItem = memo(
  ({
    item,
    formatMessageTime,
  }: {
    item: ChatMessage;
    formatMessageTime: (timestamp: string) => string;
  }) => {
    const isCurrentUser = item.sender === "current-user";

    return (
      <View
        className={`mb-3 max-w-3/4 ${isCurrentUser ? "self-end" : "self-start"}`}
      >
        <Box
          className={`rounded-2xl p-3 ${isCurrentUser ? "bg-primary-500" : "bg-gray-200"}`}
        >
          <Text
            className={` ${isCurrentUser ? "text-white" : "text-gray-800"}`}
          >
            {item.text}
          </Text>
          <Text
            className={`text-xs mt-1 ${isCurrentUser ? "text-white/70" : "text-gray-500"}`}
          >
            {formatMessageTime(item.timestamp)}
            {isCurrentUser && item.status && (
              <Text className="ml-1">
                {" "}
                · {item.status === "read" ? "Read" : item.status}
              </Text>
            )}
          </Text>
        </Box>
      </View>
    );
  },
);

// Add display name to fix ESLint warning
MessageItem.displayName = "MessageItem";

const ConversationScreen = () => {
  const params = useLocalSearchParams();
  const conversationId = params.conversation as string;

  const [newMessage, setNewMessage] = useState("");
  const [formattedMessages, setFormattedMessages] = useState<ChatMessage[]>([]);
  const [unreadMessagesToMark, setUnreadMessagesToMark] = useState<string[]>(
    [],
  );
  const flatListRef = useRef<FlatList>(null);

  // Get conversation and messages using custom hooks
  const { conversation, isLoading: isLoadingConversation } =
    useGetConversation(conversationId);
  const {
    messages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useGetMessages(conversationId);

  // Mutations
  const { mutate: sendMessageMutation, isPending: isSendingMessage } =
    useSendMessage(conversationId);
  const { mutate: markAsReadMutation } = useMarkAsRead(conversationId);

  // Format message time
  const formatMessageTime = useCallback((timestamp: string) => {
    try {
      const date = new Date(timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      hours = hours ? hours : 12;

      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

      return `${hours}:${formattedMinutes} ${ampm}`;
    } catch (e) {
      return "";
    }
  }, []);

  // Extract the other participant's info
  const otherUserId = conversation?.participants?.find(
    (p: any) => p !== conversation.lastMessageSenderId,
  );

  // Convert messages from API to match your ChatMessage format
  useEffect(() => {
    if (!messages || !otherUserId) return;

    const formatted = messages.map((msg: any) => ({
      id: msg.messageId,
      text: msg.text,
      timestamp: new Date(msg.timestamp).toISOString(),
      sender: msg.senderId === otherUserId ? "user" : "current-user",
      status:
        msg.status && msg.status[otherUserId]
          ? msg.status[otherUserId].toLowerCase()
          : "sent",
    }));

    setFormattedMessages(formatted);

    // Collect unread message IDs but don't mark them yet
    const unreadMessageIds = messages
      .filter(
        (msg: any) =>
          msg.status &&
          msg.status[otherUserId] !== "READ" &&
          msg.senderId !== otherUserId,
      )
      .map((msg: any) => msg.messageId);

    if (unreadMessageIds.length > 0) {
      setUnreadMessagesToMark(unreadMessageIds);
    }
  }, [messages, otherUserId]);

  // Separate effect to mark messages as read
  useEffect(() => {
    if (unreadMessagesToMark.length > 0) {
      markAsReadMutation(unreadMessagesToMark);
      setUnreadMessagesToMark([]);
    }
  }, [unreadMessagesToMark, markAsReadMutation]);

  // Render message component
  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      return <MessageItem item={item} formatMessageTime={formatMessageTime} />;
    },
    [formatMessageTime],
  );

  // Handle sending a message
  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() === "") return;

    // Optimistically update the UI
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toISOString(),
      sender: "current-user",
      status: "sent",
    };

    setFormattedMessages((prev) => [tempMessage, ...prev]);
    setNewMessage("");

    // Actually send the message
    sendMessageMutation(newMessage.trim(), {
      onSuccess: () => {
        // Message sent successfully
        refetchMessages();
      },
      onError: () => {
        // Handle error
        setFormattedMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id ? { ...msg, status: "error" } : msg,
          ),
        );
      },
    });
  }, [newMessage, sendMessageMutation, refetchMessages]);

  // Loading state
  if (
    isLoadingConversation ||
    (isLoadingMessages && formattedMessages.length === 0)
  ) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0056b3" />
      </ThemedView>
    );
  }

  // Determine other user display info
  const otherUserName = conversation?.participantNames?.[0] || "User";
  const otherUserAvatar = conversation?.participantAvatars?.[0];

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="border-b border-gray-200 pb-2">
          <View className="px-2 flex-row items-center">
            <BackButton />

            <HStack className="items-center">
              <Avatar size="sm" className="mr-2">
                {otherUserAvatar ? (
                  <AvatarImage source={{ uri: otherUserAvatar }} />
                ) : (
                  <AvatarFallbackText>
                    {otherUserName.charAt(0)}
                  </AvatarFallbackText>
                )}
              </Avatar>
              <View>
                <ThemedText className="font-semibold">
                  {otherUserName}
                </ThemedText>
              </View>
            </HStack>
          </View>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={formattedMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
          }}
          inverted
          onRefresh={refetchMessages}
          refreshing={isLoadingMessages}
        />

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <HStack className="p-2 border-t border-gray-200 bg-white">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={newMessage.trim() === "" || isSendingMessage}
              className={`rounded-full w-10 h-10 items-center justify-center ${
                newMessage.trim() === "" || isSendingMessage
                  ? "bg-gray-300"
                  : "bg-primary-500"
              }`}
            >
              {isSendingMessage ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={18} color="white" />
              )}
            </TouchableOpacity>
          </HStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ConversationScreen;
