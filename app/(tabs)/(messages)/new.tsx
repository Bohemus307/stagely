// app/(tabs)/(messages)/new.tsx
import { ThemedText } from "@/components/ThemedText";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { router } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import { ActivityIndicator, FlatList, View, Alert } from "react-native";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icon";
import { useCreateConversation } from "@/hooks/messaging/useCreateConversation";
import { useAuth0 } from "react-native-auth0";
import { useAuthUser } from "@/hooks/useAuthUser";
import Constants from "expo-constants";

// Define types
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
}

interface CreateConversationResponse {
  success: boolean;
  conversation?: {
    conversationId: string;
    participants: number[];
    createdAt: number;
  };
  message?: {
    messageId: string;
    text: string;
    timestamp: number;
  };
  error?: string;
}

const NewMessageScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");

  const { getCredentials } = useAuth0();
  const { backendUser, isLoading: isLoadingUser } = useAuthUser();

  const { mutate: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

  const searchUsers = useCallback(async () => {
    if (searchQuery.trim().length < 2) {
      setFilteredUsers([]);
      return;
    }

    setIsSearchingUsers(true);

    const apiUrl =
      Constants.expoConfig?.extra?.stagelyApiUrl ||
      process.env.STAGELY_API_URL ||
      "api-staging.stagely.com";

    try {
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        Alert.alert(
          "Authentication Error",
          "Failed to get authentication token. Please log in again.",
        );
        setIsSearchingUsers(false);
        return;
      }

      const url = `https://${apiUrl}/users/search?query=${encodeURIComponent(searchQuery)}&limit=10`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      if (response.ok) {
        const data: User[] = await response.json();

        // Filter out placeholder users (invited but not active)
        const activeUsers = data.filter((user) => {
          const isPlaceholder =
            user.firstName === "Invited" && user.lastName === "User";
          return !isPlaceholder;
        });

        console.log(`Found ${activeUsers.length} active users`);
        setFilteredUsers(activeUsers || []);
      } else {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);

        if (response.status === 401) {
          Alert.alert(
            "Authentication Error",
            "Your session has expired. Please log in again.",
          );
        } else {
          Alert.alert(
            "Error",
            `Failed to search for users (${response.status})`,
          );
        }
      }
    } catch (error: any) {
      console.error("Error searching users:", error);
      const errorMessage = error.message || "Unknown error";

      if (errorMessage.includes("Network request failed")) {
        Alert.alert(
          "Network Error",
          "Could not connect to the server. Please check your internet connection and try again.",
        );
      } else {
        Alert.alert("Error", `Failed to search for users: ${errorMessage}`);
      }
    } finally {
      setIsSearchingUsers(false);
    }
  }, [searchQuery, getCredentials]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers();
      } else {
        setFilteredUsers([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]);

  // Debug version of the handleUserSelect function in your NewMessageScreen component
  // Replace your existing handleUserSelect function with this debug version:

  const handleUserSelect = (user: User) => {
    console.log("=== HANDLE USER SELECT DEBUG ===");
    console.log("1. Selected user:", JSON.stringify(user, null, 2));
    console.log("2. Backend user:", JSON.stringify(backendUser, null, 2));
    console.log("3. Initial message:", initialMessage);

    if (!backendUser) {
      console.error("4. ERROR: Backend user not available");
      Alert.alert(
        "Error",
        "User information not available. Please login again.",
      );
      return;
    }

    const requestParams = {
      participants: [user.id],
      initialMessage: initialMessage || undefined,
      userId: backendUser.id,
    };

    console.log(
      "4. Request parameters:",
      JSON.stringify(requestParams, null, 2),
    );
    console.log("5. Calling createConversation mutation...");

    createConversation(requestParams, {
      onSuccess: (data: any) => {
        console.log("=== MUTATION SUCCESS CALLBACK ===");
        console.log("6. Raw success data received:");
        console.log("   - Type:", typeof data);
        console.log("   - Is null/undefined:", data == null);
        console.log("   - Is object:", typeof data === "object");
        console.log("   - JSON stringify:", JSON.stringify(data, null, 2));

        if (data) {
          console.log("7. Data structure analysis:");
          console.log("   - Keys:", Object.keys(data));
          console.log("   - Has success property:", "success" in data);
          console.log("   - Success value:", data.success);
          console.log(
            "   - Has conversation property:",
            "conversation" in data,
          );
          console.log("   - Has message property:", "message" in data);
          console.log("   - Has error property:", "error" in data);

          if (data.conversation) {
            console.log("8. Conversation object analysis:");
            console.log("   - Conversation type:", typeof data.conversation);
            console.log(
              "   - Conversation keys:",
              Object.keys(data.conversation),
            );
            console.log(
              "   - ConversationId:",
              data.conversation.conversationId,
            );
            console.log("   - Participants:", data.conversation.participants);
          } else {
            console.log("8. No conversation object found in data");
          }

          if (data.message) {
            console.log("9. Message object analysis:");
            console.log("   - Message type:", typeof data.message);
            console.log("   - Message keys:", Object.keys(data.message));
            console.log("   - MessageId:", data.message.messageId);
            console.log("   - Text:", data.message.text);
          } else {
            console.log("9. No message object found in data");
          }
        } else {
          console.log("7. Data is null or undefined");
        }

        // Check for explicit failure
        if (data?.success === false) {
          console.log("10. Explicit failure detected");
          console.log("    - Error:", data.error);
          Alert.alert("Error", data.error || "Failed to create conversation");
          return;
        }

        // Try multiple ways to get conversation ID
        const conversationId =
          data?.conversation?.conversationId ||
          data?.conversationId ||
          (data?.conversation && typeof data.conversation === "string"
            ? data.conversation
            : null);

        console.log("11. Conversation ID extraction:");
        console.log(
          "    - From data.conversation.conversationId:",
          data?.conversation?.conversationId,
        );
        console.log("    - From data.conversationId:", data?.conversationId);
        console.log("    - Final conversationId:", conversationId);

        if (conversationId) {
          console.log("12. SUCCESS: Found conversation ID, navigating...");
          console.log("    - ConversationId:", conversationId);
          console.log("    - Target user ID:", user.id);

          const navigationParams = {
            pathname: "/(tabs)/(messages)/[conversation]" as const,
            params: {
              conversation: conversationId,
              userId: user.id.toString(),
            },
          };

          console.log(
            "    - Navigation params:",
            JSON.stringify(navigationParams, null, 2),
          );

          try {
            router.push(navigationParams);
            console.log("13. Navigation initiated successfully");
          } catch (navError) {
            console.error("13. Navigation error:", navError);
            Alert.alert("Error", "Failed to navigate to conversation");
          }
        } else {
          console.error("12. ERROR: No conversation ID found");
          console.error(
            "    - Full data structure:",
            JSON.stringify(data, null, 2),
          );
          Alert.alert(
            "Error",
            "Could not create conversation. Missing conversation ID. Please try again.",
          );
        }
      },
      onError: (error: Error) => {
        console.log("=== MUTATION ERROR CALLBACK ===");
        console.error("Error type:", typeof error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("Full error object:", error);

        Alert.alert("Error", `Failed to create conversation: ${error.message}`);
      },
    });
  };

  // Also add this debug function to check your current data flow:
  const debugCurrentState = () => {
    console.log("=== CURRENT STATE DEBUG ===");
    console.log("Backend user:", backendUser);
    console.log("Search query:", searchQuery);
    console.log("Filtered users count:", filteredUsers.length);
    console.log("Initial message:", initialMessage);
    console.log("Is creating conversation:", isCreatingConversation);
    console.log("Is loading user:", isLoadingUser);
    console.log("Is searching users:", isSearchingUsers);
  };

  // Call this function when the component mounts to verify initial state
  React.useEffect(() => {
    debugCurrentState();
  }, []);

  if (isLoadingUser) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0056b3" />
        <ThemedText className="mt-4">Loading user information...</ThemedText>
      </ThemedView>
    );
  }

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      className="p-2 mb-2 bg-white rounded-lg shadow-sm"
      onPress={() => handleUserSelect(item)}
      disabled={isCreatingConversation}
    >
      <HStack className="items-center">
        <Avatar size="sm" className="mr-3">
          {item.profilePictureUrl ? (
            <AvatarImage source={{ uri: item.profilePictureUrl }} />
          ) : (
            <AvatarFallbackText>{item.firstName.charAt(0)}</AvatarFallbackText>
          )}
        </Avatar>
        <View className="flex-1">
          <ThemedText type="defaultSemiBold">
            {item.firstName} {item.lastName}
          </ThemedText>
          <ThemedText className="text-sm text-gray-500">
            {item.email}
          </ThemedText>
        </View>
        {isCreatingConversation && (
          <ActivityIndicator size="small" color="#0056b3" />
        )}
      </HStack>
    </Pressable>
  );

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <BackButton />
        <View className="flex-row items-center px-4 mb-4">
          <ThemedText type="defaultSemiBold">New Message</ThemedText>
        </View>

        <View className="p-4 flex-1">
          {/* Search Input */}
          <Input className="rounded-2xl border mb-4">
            <InputSlot className="pl-3">
              {isSearchingUsers ? (
                <ActivityIndicator size="small" color="#0056b3" />
              ) : (
                <InputIcon as={SearchIcon} />
              )}
            </InputSlot>
            <InputField
              placeholder="Search for users by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </Input>
          {/* Initial Message Input */}
          <Input className="rounded-2xl border mb-4">
            <InputField
              placeholder="Initial message (optional)"
              value={initialMessage}
              onChangeText={setInitialMessage}
              multiline
            />
          </Input>
          {/* Users List */}
          <ThemedText type="defaultSemiBold" className="mb-2">
            Select a user to message
          </ThemedText>
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-8">
                {searchQuery.length >= 2 && !isSearchingUsers ? (
                  <ThemedText className="text-gray-500 text-center">
                    No users found matching "{searchQuery}"
                  </ThemedText>
                ) : searchQuery.length > 0 && searchQuery.length < 2 ? (
                  <ThemedText className="text-gray-500 text-center">
                    Enter at least 2 characters to search
                  </ThemedText>
                ) : !isSearchingUsers ? (
                  <ThemedText className="text-gray-500 text-center">
                    Search for a user by name or email to start a conversation
                  </ThemedText>
                ) : null}
              </View>
            }
          />
          // Also add a debug button temporarily (you can remove this later): //
          Add this somewhere in your JSX for testing: /*
          <View className="p-4 border border-red-300 m-4">
            <ThemedText className="text-red-600 mb-2">DEBUG PANEL</ThemedText>
            <Pressable
              className="bg-red-500 p-2 rounded mb-2"
              onPress={debugCurrentState}
            >
              <ThemedText className="text-white text-center">
                Log Current State
              </ThemedText>
            </Pressable>
            <Pressable
              className="bg-blue-500 p-2 rounded"
              onPress={() => {
                // Test with a mock user
                handleUserSelect({
                  id: 3,
                  firstName: "Test",
                  lastName: "User",
                  email: "test@example.com",
                });
              }}
            >
              <ThemedText className="text-white text-center">
                Test Create Conversation
              </ThemedText>
            </Pressable>
          </View>
          */
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default NewMessageScreen;
