import React from "react";
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
import { Message, MessageUser } from "@/lib/@types/messages";

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

  const getDisplayName = (user: MessageUser): string => {
    if (user.firstName && user.lastName) {
      if (user.firstName === "Invited" && user.lastName === "User") {
        if (user.email) {
          return createNameFromEmail(user.email);
        }
        return "Invited User";
      }
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.name && user.name !== "Invited User" && user.name.trim() !== "") {
      return user.name;
    }

    if (user.email) {
      return createNameFromEmail(user.email);
    }

    return "Unknown User";
  };

  const createNameFromEmail = (email: string): string => {
    const emailUsername = email.split("@")[0];
    return emailUsername
      .replace(/[._-]/g, " ")
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getAvatarFallback = (user: MessageUser): string => {
    if (user.firstName && user.lastName) {
      if (user.firstName === "Invited" && user.lastName === "User") {
        if (user.email) {
          return createNameFromEmail(user.email).charAt(0).toUpperCase();
        }
        return "?";
      }
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }

    const displayName = getDisplayName(user);
    return displayName.charAt(0).toUpperCase();
  };

  const displayName = getDisplayName(message.user);

  const shouldShowEmail = () => {
    return (
      message.user.email &&
      (displayName.includes("@") ||
        displayName === "Invited User" ||
        displayName === "Unknown User" ||
        (!message.user.firstName &&
          !message.user.lastName &&
          !message.user.name))
    );
  };

  return (
    <TouchableOpacity onPress={() => onPress(message)} className="mb-2">
      <Box
        className={`bg-white p-2 shadow-sm rounded-lg ${message.unread ? "border-l-4 border-primary-500" : ""}`}
      >
        <HStack className="justify-between items-center">
          <Avatar size="sm">
            {message.user.avatar ? (
              <AvatarImage source={{ uri: message.user.avatar }} />
            ) : (
              <AvatarFallbackText>
                {getAvatarFallback(message.user)}
              </AvatarFallbackText>
            )}
          </Avatar>

          <VStack className="flex-1">
            <HStack className="flex-1">
              <VStack className="flex-1 ml-2">
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {displayName}
                </ThemedText>
                {/* Show email as subtitle when appropriate */}
                {shouldShowEmail() && (
                  <ThemedText
                    className="text-xs text-primary-500"
                    numberOfLines={1}
                  >
                    {message.user.email}
                  </ThemedText>
                )}
              </VStack>

              <HStack className="items-center">
                <ThemedText className="text-xs text-primary-500">
                  {formatMessageTime(message.timestamp)}
                </ThemedText>
              </HStack>
            </HStack>

            <ThemedText
              type="default"
              numberOfLines={2}
              className={`mt-1 ml-2 ${message.unread ? "font-medium" : "text-primary-600"}`}
            >
              {message.lastMessage}
            </ThemedText>
          </VStack>
        </HStack>
      </Box>
    </TouchableOpacity>
  );
};

export default MessageCard;
