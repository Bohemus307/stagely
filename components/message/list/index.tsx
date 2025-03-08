import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { FlatList } from "react-native";
import MessageCard from "./MessageCard";
import { mockMessages } from "../data/messages";
import { Fab } from "@/components/ui/fab";

export interface Message {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: "owner" | "cleaner" | "manager";
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  propertyId?: number;
  propertyName?: string;
}

interface MessageListProps {
  searchQuery?: string;
  statusFilter?: string | null;
}

const MessagesList: React.FC<MessageListProps> = ({
  searchQuery = "",
  statusFilter = null,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    //simulate fetching messages from API
    const fetchMessages = async () => {
      try {
        //Mock Data
        setTimeout(() => {
          setMessages(mockMessages);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((message) => {
    // Apply text search filter
    const matchesSearch =
      message.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (message.propertyName &&
        message.propertyName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Apply status filter
    let matchesStatus = true;
    if (statusFilter === "Unread") {
      matchesStatus = message.unread;
    } else if (statusFilter === "Team") {
      matchesStatus =
        message.user.role === "cleaner" || message.user.role === "manager";
    } else if (statusFilter === "Tenants") {
      matchesStatus =
        message.user.role !== "cleaner" && message.user.role !== "manager";
    }

    return matchesSearch && matchesStatus;
  });

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
    // Navigate to a new message screen or open a new message modal
    router.push({
      pathname: "/(tabs)/(messages)", // Adjust this path
    });
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
