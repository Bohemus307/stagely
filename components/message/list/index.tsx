import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { ScrollView } from "react-native";
import MessageCard from "./MessageCard";
import { mockMessages } from "../data/messages";

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
}

const MessagesList: React.FC<MessageListProps> = ({ searchQuery = "" }) => {
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

  const filteredMessages = messages.filter(
    (message) =>
      message.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (message.propertyName &&
        message.propertyName.toLowerCase().includes(searchQuery.toLowerCase())),
  );

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
        {searchQuery
          ? "No messages match your search"
          : "No messages yet. Start a conversation!"}
      </ThemedText>
    </Box>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        flexGrow: filteredMessages.length ? 0 : 1,
      }}
    >
      {filteredMessages.length > 0
        ? filteredMessages.map((item) => (
            <MessageCard
              key={item.id}
              message={item}
              onPress={handleMessagePress}
            />
          ))
        : renderEmpty()}
    </ScrollView>
  );
};

export default MessagesList;
