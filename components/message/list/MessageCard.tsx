import React from "react";
import { Message } from "../data/messages";
import { TouchableOpacity, View } from "react-native";
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
      <Box
        className={`${message.urgent ? "border-l-4 border-amber-500" : ""} bg-white p-2 shadow-sm rounded-lg`}
      >
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

            <HStack className="justify-between items-center">
              {message.propertyName ? (
                <HStack className="items-center">
                  <IconSymbol
                    name="building.2.fill"
                    size={12}
                    color="#6b7280"
                  />
                  <ThemedText type="default">{message.propertyName}</ThemedText>
                </HStack>
              ) : (
                <View />
              )}

              {message.unread && (
                <Badge className="bg-red-500 h-3 w-3 rounded-full" />
              )}
            </HStack>
          </VStack>
        </HStack>
        <ThemedText
          type="default"
          className={`mt-1 ${message.unread}`}
          numberOfLines={1}
        >
          {message.lastMessage}
        </ThemedText>
      </Box>
    </TouchableOpacity>
  );
};

export default MessageCard;
