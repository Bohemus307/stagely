// components/message/list/MessageCard.tsx
import React from "react";
import { Message } from "../data/messages";
import { TouchableOpacity } from "react-native";
import { HStack } from "@/components/ui/hstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { ThemedText } from "@/components/ThemedText";
import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { formatDate } from "../lib/utils/timeHelpers";

interface MessageCardProps {
  message: Message;
  onPress: (message: Message) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onPress }) => {
  const formatMessageTime = (timestamp: string) => {
    try {
      return formatDate(timestamp);
    } catch (e) {
      console.error("Error formatting timestamp:", e);
      return timestamp;
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(message)} className="mb-2">
      <Box className={`bg-white p-2 shadow-sm rounded-lg`}>
        <HStack className="space-x-3 items-start">
          <Avatar size="sm" className="mr-3">
            {message.user.avatar ? (
              <AvatarImage source={{ uri: message.user.avatar }} />
            ) : (
              <AvatarFallbackText>
                {message.user.name.charAt(0)}
              </AvatarFallbackText>
            )}
          </Avatar>

          <VStack className="flex-1">
            <HStack className="justify-between items-center">
              <ThemedText type="defaultSemiBold">
                {message.user.name}
              </ThemedText>
              <ThemedText type="default">
                {formatMessageTime(message.timestamp)}
              </ThemedText>
            </HStack>
          </VStack>
        </HStack>
        <HStack className="justify-between items-center mt-1">
          <ThemedText type="default" numberOfLines={1} className="flex-1">
            {message.lastMessage}
          </ThemedText>

          {message.unread && (
            <Badge className="bg-red-500 h-3 w-3 rounded-full ml-2" />
          )}
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

export default MessageCard;
