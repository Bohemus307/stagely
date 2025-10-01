import { useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import {
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import { useGetConversation } from "@/hooks/messaging/useConversations";
import {
  useGetMessages,
  useSendMessage,
  useMarkAsRead,
} from "@/hooks/messaging/useMessages";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ChatMessage } from "@/lib/@types/messages";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFocusEffect } from "@react-navigation/native";

const getDisplayName = (participant: any): string => {
  if (
    participant?.firstName &&
    participant?.lastName &&
    !(participant.firstName === "Invited" && participant.lastName === "User")
  ) {
    return `${participant.firstName} ${participant.lastName}`;
  }

  if (
    participant?.name &&
    participant.name !== "Invited User" &&
    participant.name.trim() !== ""
  ) {
    return participant.name;
  }

  if (participant?.email) {
    const emailUsername = participant.email.split("@")[0];
    return emailUsername
      .replace(/[._]/g, " ")
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return "Unknown User";
};

const isPlaceholderUser = (participant: any): boolean => {
  return (
    !participant?.firstName ||
    !participant?.lastName ||
    participant.firstName === "Invited" ||
    participant.lastName === "User" ||
    participant.name === "Invited User" ||
    !participant.name ||
    participant.name.trim() === ""
  );
};

const MessageItem = memo(
  ({
    item,
    formatMessageTime,
  }: {
    item: ChatMessage;
    formatMessageTime: (timestamp: string) => string;
  }) => {
    const isCurrentUser = item.sender === "current-user";
    const [showTimestamp, setShowTimestamp] = useState(false);

    const toggleTimestamp = () => {
      setShowTimestamp(!showTimestamp);
    };

    return (
      <View
        className={`mb-3 max-w-3/4 ${isCurrentUser ? "self-end" : "self-start"}`}
      >
        <TouchableOpacity onPress={toggleTimestamp} activeOpacity={0.7}>
          <Box
            className={`rounded-2xl p-3 ${isCurrentUser ? "bg-primary-500" : "bg-gray-200"}`}
          >
            <Text
              className={`${isCurrentUser ? "text-white" : "text-gray-800"}`}
            >
              {item.text}
            </Text>
            {showTimestamp && (
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
            )}
          </Box>
        </TouchableOpacity>
      </View>
    );
  },
);

MessageItem.displayName = "MessageItem";

const ConversationScreen = () => {
  const params = useLocalSearchParams();
  const conversationId = params.conversation as string;
  const insets = useSafeAreaInsets();
  const { backendUser, isLoading: isLoadingUser } = useAuthUser();
  const [newMessage, setNewMessage] = useState("");
  const [formattedMessages, setFormattedMessages] = useState<ChatMessage[]>([]);
  const [unreadMessagesToMark, setUnreadMessagesToMark] = useState<string[]>(
    [],
  );

  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const otherUserId = useMemo(() => Number(params.userId), [params.userId]);

  const { conversation, isLoading: isLoadingConversation } =
    useGetConversation(conversationId);

  const {
    messages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useGetMessages(conversationId);

  const { mutate: sendMessageMutation, isPending: isSendingMessage } =
    useSendMessage(conversationId);

  const { mutate: markAsReadMutation } = useMarkAsRead(conversationId);

  useEffect(() => {
    setNewMessage("");
  }, [conversationId]);

  useEffect(() => {
    setFormattedMessages([]);
    setUnreadMessagesToMark([]);
    setNewMessage("");
  }, [backendUser?.id]);

  useFocusEffect(
    useCallback(() => {
      // Start polling when screen is focused
      pollingIntervalRef.current = setInterval(() => {
        refetchMessages();
      }, 3000); // Poll every 3 seconds

      // Clean up polling when screen loses focus
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }, [refetchMessages]),
  );
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return "";
    }
  }, []);

  useEffect(() => {
    if (isLoadingMessages || isLoadingConversation) {
      return;
    }

    if (!backendUser?.id) {
      return;
    }

    if (!messages || messages.length === 0) {
      setFormattedMessages([]);
      setUnreadMessagesToMark([]);
      return;
    }

    const processMessages = () => {
      const formatted = messages.map((msg: any) => ({
        id: msg.messageId,
        text: msg.text,
        timestamp: new Date(msg.timestamp).toISOString(),
        sender: msg.senderId === backendUser.id ? "current-user" : "user",
        status: msg.status
          ? msg.senderId === backendUser.id
            ? (msg.status[otherUserId.toString()] || "sent").toLowerCase()
            : (
                msg.status[backendUser.id.toString()] || "delivered"
              ).toLowerCase()
          : "sent",
      }));

      const unreadMessageIds = messages
        .filter(
          (msg: any) =>
            msg.senderId !== backendUser.id &&
            msg.status &&
            msg.status[backendUser.id.toString()] !== "READ",
        )
        .map((msg: any) => msg.messageId);

      setFormattedMessages(formatted);

      if (unreadMessageIds.length > 0) {
        setUnreadMessagesToMark(unreadMessageIds);
      }
    };

    processMessages();
  }, [
    messages,
    otherUserId,
    backendUser?.id,
    isLoadingMessages,
    isLoadingConversation,
  ]);

  // Mark messages as read
  useEffect(() => {
    if (unreadMessagesToMark.length > 0 && backendUser?.id) {
      const timeoutId = setTimeout(() => {
        markAsReadMutation({
          userId: backendUser.id,
          messageIds: unreadMessagesToMark,
        });
        setUnreadMessagesToMark([]);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [unreadMessagesToMark, markAsReadMutation, backendUser?.id]);

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      return <MessageItem item={item} formatMessageTime={formatMessageTime} />;
    },
    [formatMessageTime],
  );

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() === "" || !backendUser?.id || isSendingMessage) {
      return;
    }

    const messageText = newMessage.trim();

    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date().toISOString(),
      sender: "current-user",
      status: "sent",
    };

    setFormattedMessages((prev) => [tempMessage, ...prev]);
    setNewMessage("");

    sendMessageMutation(
      {
        userId: backendUser.id,
        text: messageText,
      },
      {
        onSuccess: () => {
          refetchMessages();
        },
        onError: (error) => {
          Alert.alert("Error", `Failed to send message: ${error.message}`);

          setFormattedMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessage.id ? { ...msg, status: "error" } : msg,
            ),
          );
        },
      },
    );
  }, [
    newMessage,
    sendMessageMutation,
    refetchMessages,
    backendUser?.id,
    isSendingMessage,
  ]);

  if (
    isLoadingUser ||
    isLoadingConversation ||
    (isLoadingMessages && formattedMessages.length === 0)
  ) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0056b3" />
        <ThemedText className="mt-2">Loading conversation...</ThemedText>
      </ThemedView>
    );
  }

  if (!backendUser) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ThemedText>User not found.</ThemedText>
      </ThemedView>
    );
  }

  const otherParticipant = conversation?.otherParticipant;
  const otherUserName = otherParticipant
    ? getDisplayName(otherParticipant)
    : conversation?.participantNames?.[0] || "User";
  const otherUserAvatar =
    otherParticipant?.profilePictureUrl ||
    conversation?.participantAvatars?.[0];
  const showEmailSubtitle =
    otherParticipant && isPlaceholderUser(otherParticipant);

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 pb-2">
          <View className="px-2 flex-row items-center">
            <BackButton />
          </View>
          <View>
            <HStack className="items-center ml-24">
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
                {/* Show email as subtitle for placeholder users */}
                {showEmailSubtitle && conversation?.otherParticipant?.email && (
                  <ThemedText className="text-xs text-gray-500">
                    {conversation.otherParticipant.email}
                  </ThemedText>
                )}
              </View>
            </HStack>
          </View>
        </View>
        <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
          {/* Message List */}
          <View style={{ flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={formattedMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
              style={{ flex: 1 }}
              inverted
              onRefresh={refetchMessages}
              refreshing={isLoadingMessages}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            />
          </View>

          {/* Message Input */}
          <View
            className="border-t border-gray-200 px-2 pt-2 pb-2 flex-row items-center"
            style={{
              borderTopColor: "#e5e7eb",
              paddingBottom: insets.bottom + 16,
            }}
          >
            <TextInput
              ref={textInputRef}
              className="flex-1 rounded-full px-4 items-center mr-2 text-base"
              style={{
                backgroundColor: "#f3f4f6",
                height: 45,
              }}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
              editable={!!backendUser?.id && !isSendingMessage}
              autoCorrect={false}
              autoCapitalize="sentences"
              keyboardType="default"
              textContentType="none"
              autoComplete="off"
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="rounded-full w-10 h-10 justify-center items-center"
              style={{
                backgroundColor: "#042C44",
              }}
            >
              <IconSymbol name="paperplane.fill" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ConversationScreen;
