import { useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  mockConversations,
  mockUsers,
  UserDictionary,
  ConversationDictionary,
} from "../data/messages";
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
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Ionicons } from "@expo/vector-icons";
import { useAuth0 } from "react-native-auth0";
import { ChatMessage, MessageUser } from "@/components/message/data/messages";

const ConversationScreen = () => {
  const { user: auth0User } = useAuth0();
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const propertyId = params.propertyId as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<MessageUser | null>(null);
  const [propertyName, setPropertyName] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (userId) {
      // Get user data - type assertion to address indexing issue
      const user = (mockUsers as UserDictionary)[userId];
      setOtherUser(user);

      // Get Conversation Data - type assertion to address indexing issue
      const conversation =
        (mockConversations as ConversationDictionary)[userId] || [];
      setMessages(conversation);

      // Eventually fetch the property name from API
      if (propertyId) {
        // mock data
        const propertyNames: Record<string, string> = {
          "1": "588 Cortez St",
          "2": "742 Evergreen Terrace",
          "3": "221B Baker St",
          "5": "350 Fifth Avenue",
          "6": "123 Main St",
        };

        setPropertyName(propertyNames[propertyId] || "");
      }

      if (auth0User) {
        console.log("Current Auth0 user in conversation:", auth0User.name);
        // In a real app, you would use the auth0User ID to validate permissions
        // or to track which user is viewing the conversation
      }
    }
  }, [userId, propertyId, auth0User]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage,
      timestamp: new Date().toISOString(),
      sender: "current-user",
      status: "sent",
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");

    // Scroll to bottom when new msg is added
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (timestamp: string) => {
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
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isCurrentUser = item.sender === "current-user";

    return (
      <View
        className={`mb-3 max-w-3/4 ${isCurrentUser ? "self-end" : "self-start"}`}
      >
        <Box
          className={`rounded-2xl p-3 ${isCurrentUser ? "bg-primary-500" : "bg-gray-200"}`}
        >
          <ThemedText
            className={isCurrentUser ? "text-white" : "text-gray-800"}
          >
            {item.text}
          </ThemedText>
          <ThemedText
            className={`text-xs mt-1 ${isCurrentUser ? "text-white/70" : "text-gray-500"}`}
          >
            {formatMessageTime(item.timestamp)}
            {isCurrentUser && item.status && (
              <ThemedText className="ml-1">
                {" "}
                · {item.status === "read" ? "Read" : item.status}
              </ThemedText>
            )}
          </ThemedText>
        </Box>
      </View>
    );
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <View className="border-b border-gray-200 pb-2">
          <View className="px-2 flex-row items-center">
            <BackButton />

            {otherUser && (
              <HStack className="items-center">
                <Avatar size="sm" className="mr-2">
                  {otherUser.avatar ? (
                    <AvatarImage source={{ uri: otherUser.avatar }} />
                  ) : (
                    <AvatarFallbackText>
                      {otherUser.name.charAt(0)}
                    </AvatarFallbackText>
                  )}
                </Avatar>
                <View>
                  <ThemedText className="font-semibold">
                    {otherUser.name}
                  </ThemedText>
                  {propertyName && (
                    <HStack className="items-center">
                      <IconSymbol
                        name="building.2.fill"
                        size={12}
                        color="#6b7280"
                      />
                      <ThemedText>{propertyName}</ThemedText>
                    </HStack>
                  )}
                </View>
              </HStack>
            )}
          </View>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
          }}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
              onPress={sendMessage}
              disabled={newMessage.trim() === ""}
              className={`rounded-full w-10 h-10 items-center justify-center ${
                newMessage.trim() === "" ? "bg-gray-300" : "bg-primary-500"
              }`}
            >
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          </HStack>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
};

export default ConversationScreen;
