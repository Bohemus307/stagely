import React from "react";
import { Message } from ".";
import { TouchableOpacity } from "react-native";
import { HStack } from "@/components/ui/hstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Badge } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { formatDate } from "../lib/utils/detailsHelpers";

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
      <Box className="bg-white p-3 rounded-lg">
        <HStack className="space-x-3 items-center">
          <Avatar size="md">
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
              <ThemedText>{message.user.name}</ThemedText>
              <ThemedText>{formatMessageTime(message.timestamp)}</ThemedText>
            </HStack>

            {message.propertyName && (
              <HStack className="items-center">
                <IconSymbol name="building.2.fill" size={12} color="#6b7280" />
                <ThemedText>{message.propertyName}</ThemedText>
              </HStack>
            )}

            <ThemedText
              className={`text-sm mt-1 ${message.unread ? "font-medium" : "text-gray-600"}`}
              numberOfLines={1}
            >
              {message.lastMessage}
            </ThemedText>
          </VStack>

          {message.unread && (
            <Badge className="bg-primary-500 h-3 w-3 rounded-full" />
          )}
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

export default MessageCard;
