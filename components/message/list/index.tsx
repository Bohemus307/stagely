import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { FlatList } from "react-native";
import MessageCard from "./MessageCard";
import { mockMessages } from "../data/messages";
import { Fab } from "@/components/ui/fab";
import { useAuth0 } from "react-native-auth0";
import { Message } from "@/components/message/data/messages";
import { filterMessages } from "../lib/utils/messageHelpers";

export interface MessageListProps {
  searchQuery?: string;
  statusFilter?: string | null;
}

const MessagesList: React.FC<MessageListProps> = ({
  searchQuery = "",
  statusFilter = null,
}) => {
  const { user } = useAuth0();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching messages from API
    const fetchMessages = async () => {
      try {
        // Mock Data
        setTimeout(() => {
          // We're using the mockMessages as they already have urgent flags
          setMessages(mockMessages);
          setIsLoading(false);

          // Log the current Auth0 user - in a real app you'd use this to fetch user-specific messages
          if (user) {
            console.log("Current Auth0 user:", user.name);
            // In a real application, you would fetch messages for this specific user
            // Example: const response = await fetch(`/api/messages?userId=${user.sub}`);
          }
        }, 500);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  //helper function to filter
  const filteredMessages = filterMessages(messages, searchQuery, statusFilter);

  const handleMessagePress = (message: Message) => {
    router.push({
      pathname: "/(tabs)/(messages)/[conversation]",
      params: {
        conversation: message.user.id,
        userId: message.user.id,
        propertyId: message.propertyId,
      },
    });
  };

  const renderEmpty = () => (
    <Box className="flex-1 justify-center items-center p-8">
      <IconSymbol name="message.fill" size={48} color="#9CA3AF" />
      <ThemedText className="text-center mt-4 text-gray-500">
        {searchQuery || statusFilter
          ? "No messages match your search"
          : "No messages yet. Start a conversation!"}
      </ThemedText>
    </Box>
  );

  // Fab button
  const handleNewMessage = () => {
    router.push("/(tabs)/(messages)/new");
  };

  return (
    <Box className="flex-1 relative bg-primary-50">
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
        className="flex-1"
        ListEmptyComponent={renderEmpty}
      />
      <Fab
        size="lg"
        placement="bottom right"
        onPress={handleNewMessage}
        className="mb-14 mr-4"
      >
        <IconSymbol name="message.fill" size={24} color="white" />
      </Fab>
    </Box>
  );
};

export default MessagesList;
