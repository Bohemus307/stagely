import { useMemo } from "react";
import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import {
  FlatList,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Fab, FabIcon } from "@/components/ui/fab";
import { AddIcon } from "@/components/ui/icon";
import MessageCard from "./MessageCard";
import { filterMessages } from "../lib/utils/messageHelpers";
import { useGetConversations } from "@/hooks/messaging/useConversations";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Conversation, Message } from "@/lib/@types/messages";

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

  const formattedMessages = useMemo(() => {
    if (!conversations || conversations.length === 0 || !backendUser?.id) {
      return [];
    }

    return conversations.map((conv: Conversation) => {
      const participants = conv.participants || [];

      const otherParticipantId = participants.find(
        (p: any) => p !== backendUser.id,
      );

      const getUserInfo = () => {
        let firstName = "";
        let lastName = "";
        let email = "";
        let avatar = "";
        let displayName = "";

        if (conv.otherParticipant) {
          firstName = conv.otherParticipant.firstName || "";
          lastName = conv.otherParticipant.lastName || "";
          email = conv.otherParticipant.email || "";
          avatar = conv.otherParticipant.profilePictureUrl || "";

          if (
            firstName &&
            lastName &&
            !(firstName === "Invited" && lastName === "User")
          ) {
            displayName = `${firstName} ${lastName}`;
          } else if (
            conv.otherParticipant.name &&
            conv.otherParticipant.name !== "Invited User"
          ) {
            displayName = conv.otherParticipant.name;
          }
        }

        if (!firstName && conv.participantFirstNames?.length) {
          firstName = conv.participantFirstNames[0] || "";
        }
        if (!lastName && conv.participantLastNames?.length) {
          lastName = conv.participantLastNames[0] || "";
        }
        if (!email && conv.participantEmails?.length) {
          email = conv.participantEmails[0] || "";
        }
        if (!avatar && conv.participantAvatars?.length) {
          avatar = conv.participantAvatars[0] || "";
        }

        if (!displayName) {
          if (
            firstName &&
            lastName &&
            !(firstName === "Invited" && lastName === "User")
          ) {
            displayName = `${firstName} ${lastName}`;
          } else if (
            conv.participantNames?.length &&
            conv.participantNames[0] !== "Invited User"
          ) {
            displayName = conv.participantNames[0];
          } else if (email) {
            const emailUsername = email.split("@")[0];
            displayName = emailUsername
              .replace(/[._-]/g, " ")
              .split(" ")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1),
              )
              .join(" ");
          } else {
            displayName = `User ${otherParticipantId || "Unknown"}`;
          }
        }

        return {
          firstName,
          lastName,
          email,
          avatar,
          displayName,
          id: otherParticipantId || 0,
        };
      };

      const userInfo = getUserInfo();

      const messageUser = {
        id: userInfo.id.toString(),
        name: userInfo.displayName,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        avatar: userInfo.avatar,
      };

      const hasUnread =
        conv.unreadCount && backendUser?.id
          ? conv.unreadCount[backendUser.id.toString()] > 0
          : false;

      return {
        id: conv.conversationId,
        user: messageUser,
        lastMessage: conv.lastMessageText || "Start a conversation...",
        timestamp: conv.lastMessageTime
          ? new Date(conv.lastMessageTime).toISOString()
          : new Date().toISOString(),
        unread: hasUnread,
      };
    });
  }, [conversations, backendUser?.id]);

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

  const handleNewMessage = () => {
    router.push("/(tabs)/(messages)/new");
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View className="mb-4">
      <MessageCard message={item} onPress={() => handleMessagePress(item)} />
    </View>
  );

  if (isLoading && formattedMessages.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50">
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText className="mt-4">Loading messages...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-primary-50 p-4">
        <IconSymbol
          name="exclamationmark.triangle.fill"
          size={48}
          color="red"
        />
        <ThemedText className="text-center mt-4 text-red-600">
          Error loading messages
        </ThemedText>
        <ThemedText className="text-center mt-2 text-sm">
          {error.message}
        </ThemedText>
        {error && refetch ? (
          <TouchableOpacity
            className="bg-primary-500 rounded-lg px-4 py-2 mt-4"
            onPress={() => refetch()}
          >
            <ThemedText className="text-white font-medium">
              Try Again
            </ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  const EmptyListComponent = () => (
    <View className="items-center justify-center p-8 flex-1">
      <IconSymbol
        name="message.fill"
        size={28}
        color={Colors.light.tabIconDefault}
      />
      <ThemedText className="text-center my-3">
        {searchQuery || statusFilter
          ? "No messages match your search"
          : "No messages yet. Start a conversation!"}
      </ThemedText>
      <TouchableOpacity
        className="bg-primary-500 rounded-lg px-4 py-2 mt-4"
        onPress={handleNewMessage}
      >
        <ThemedText className="text-white font-medium">New Message</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <Box className="flex-1 relative">
      <FlatList
        data={filteredMessages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item?.id?.toString() || `id#${index}`}
        contentContainerStyle={{
          paddingHorizontal: 15,
          paddingTop: 15,
          paddingBottom: 15,
          flexGrow: filteredMessages.length === 0 ? 1 : undefined,
        }}
        className="flex-1"
        showsVerticalScrollIndicator={true}
        ListEmptyComponent={<EmptyListComponent />}
        onRefresh={() => refetch()}
        refreshing={isLoading || false}
      />

      <Box className="absolute bottom-0 lg:bottom-10 right-6">
        <Fab size="lg" placement="bottom right" onPress={handleNewMessage}>
          <FabIcon size="xl" as={AddIcon} />
        </Fab>
      </Box>
    </Box>
  );
};

export default MessagesList;
