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
import { useInviteConversation } from "@/hooks/messaging/useInviteConversation";
import { useAuth0 } from "react-native-auth0";
import { VStack } from "@/components/ui/vstack";
import { ButtonText, Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { useAuthUser } from "@/hooks/useAuthUser";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
}

const NewMessageScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const { getCredentials } = useAuth0();
  const [newContactEmail, setNewContactEmail] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const { backendUser, isLoading: isLoadingUser } = useAuthUser();
  const [isCreatingContact, setIsCreatingContact] = useState(false);

  const { mutate: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

  const { mutate: inviteConversation, isPending: isInvitingUser } =
    useInviteConversation();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Create a memoized search function
  const searchUsers = useCallback(async () => {
    if (searchQuery.trim().length < 2) {
      setFilteredUsers([]);
      return;
    }

    setIsSearchingUsers(true);
    try {
      // Get auth credentials
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        console.error("No access token available");
        setIsSearchingUsers(false);
        return;
      }

      // Fetch users based on search query from API
      const response = await fetch(
        `https://${process.env.STAGELY_API_URL}/users/search?query=${encodeURIComponent(searchQuery)}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setFilteredUsers(data || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearchingUsers(false);
    }
  }, [searchQuery, getCredentials]);

  // Search for users with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers();
      } else {
        setFilteredUsers([]);
      }
    }, 500); // Add debounce of 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]);

  const handleUserSelect = (user: User) => {
    // Create a direct conversation
    if (user.id) {
      createConversation(
        {
          participants: [user.id],
          type: "general",
          initialMessage: initialMessage || undefined,
        },
        {
          onSuccess: (data) => {
            // Navigate to the conversation screen
            router.push({
              pathname: "/(tabs)/(messages)/[conversation]",
              params: {
                conversation: data.conversation.conversationId,
                userId: user.id.toString(),
              },
            });
          },
          onError: (error) => {
            Alert.alert(
              "Error",
              `Failed to create conversation: ${error.message}`,
            );
          },
        },
      );
    }
  };

  const handleCreateNewContact = async () => {
    if (!isValidEmail(newContactEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (!backendUser) {
      Alert.alert(
        "Error",
        "User information not available. Please login again.",
      );
      return;
    }

    setIsCreatingContact(true);

    // Log the attempt
    console.log("Attempting to create contact with email:", newContactEmail);
    console.log("Current user ID:", backendUser.id);
    try {
      // Use the invite conversation hook
      inviteConversation(
        {
          email: newContactEmail,
          initialMessage: initialMessage || undefined,
        },
        {
          onSuccess: (data) => {
            console.log("Success creating conversation:", data);

            if (!data || !data.conversation || !data.user) {
              console.error("Invalid response format:", data);
              Alert.alert(
                "Error",
                "Received an invalid response from the server. Please try again.",
              );
              setIsCreatingContact(false);
              return;
            }

            // Navigate to the conversation screen
            router.push({
              pathname: "/(tabs)/(messages)/[conversation]",
              params: {
                conversation: data.conversation.conversationId,
                userId: data.user.id.toString(),
              },
            });
            setIsCreatingContact(false);
          },
          onError: (error) => {
            console.error("Error creating conversation:", error);
            Alert.alert(
              "Error",
              `Failed to create conversation: ${error.message}. Please try again later.`,
            );
            setIsCreatingContact(false);
          },
        },
      );
    } catch (error) {
      console.error("Unexpected error in handleCreateNewContact:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later.",
      );
      setIsCreatingContact(false);
    }
  };

  // Add a loading state for the user
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
          <Input className="rounded-2xl border mb-4">
            <InputSlot className="pl-3">
              {isSearchingUsers ? (
                <ActivityIndicator size="small" color="#0056b3" />
              ) : (
                <InputIcon as={SearchIcon} />
              )}
            </InputSlot>
            <InputField
              placeholder="Search for a Contact by Name or Email..."
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

          <VStack className="mb-4 w-full">
            <ThemedText type="defaultSemiBold" className="mb-2">
              New Contact
            </ThemedText>
            <Input className="rounded-2xl border mb-2 w-full">
              <InputField
                placeholder="Contact Email Address"
                value={newContactEmail}
                onChangeText={setNewContactEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </Input>
            <Button
              className="rounded-md w-full"
              onPress={handleCreateNewContact}
              disabled={!isValidEmail(newContactEmail) || isInvitingUser}
            >
              <ButtonText>
                {isInvitingUser ? "Creating..." : "Create New Contact"}
              </ButtonText>
            </Button>
          </VStack>

          <Divider className="mb-4" />

          <ThemedText type="defaultSemiBold" className="mb-2">
            Contacts
          </ThemedText>

          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-8">
                {searchQuery.length >= 2 && !isSearchingUsers ? (
                  <ThemedText className="text-gray-500">
                    No contacts found matching "{searchQuery}"
                  </ThemedText>
                ) : searchQuery.length > 0 && searchQuery.length < 2 ? (
                  <ThemedText className="text-gray-500">
                    Enter at least 2 characters to search
                  </ThemedText>
                ) : !isSearchingUsers ? (
                  <ThemedText className="text-gray-500">
                    Search for a contact by name or email to start a
                    conversation
                  </ThemedText>
                ) : null}
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default NewMessageScreen;
