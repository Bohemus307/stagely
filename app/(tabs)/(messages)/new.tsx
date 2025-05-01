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
import { ActivityIndicator, FlatList, View } from "react-native";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icon";
import { useCreateConversation } from "@/hooks/messaging/useCreateConversation";
import { useAuth0 } from "react-native-auth0"; // Import Auth0 for token
import { VStack } from "@/components/ui/vstack";
import { ButtonText, Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";

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
  const { getCredentials } = useAuth0(); // Get Auth0 credentials
  const [newContactEmail, setNewContactEmail] = useState("");
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const { mutate: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

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
        },
      );
    }
  };

  const handleCreateNewContact = async () => {
    if (!isValidEmail(newContactEmail)) {
      // You could add proper error handling/toast here
      console.error("Invalid email");
      return;
    }

    setIsCreatingContact(true);
    try {
      // Get auth credentials
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        console.error("No access token available");
        setIsCreatingContact(false);
        return;
      }

      // First check if user exists
      const searchResponse = await fetch(
        `https://${process.env.STAGELY_API_URL}/users/search?query=${encodeURIComponent(newContactEmail)}&limit=1`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        },
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();

        // If user exists, create conversation with them
        if (searchData && searchData.length > 0) {
          handleUserSelect(searchData[0]);
          return;
        }

        // Otherwise, create a new invitation or placeholder user
        // This depends on your backend implementation
        const inviteResponse = await fetch(
          `https://${process.env.STAGELY_API_URL}/invitations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${credentials.accessToken}`,
            },
            body: JSON.stringify({ email: newContactEmail }),
          },
        );

        if (inviteResponse.ok) {
          const inviteData = await inviteResponse.json();

          // Create conversation with the invited user
          createConversation(
            {
              participants: [inviteData.userId], // This depends on your API response
              type: "general",
            },
            {
              onSuccess: (data) => {
                // Navigate to the conversation screen
                router.push({
                  pathname: "/(tabs)/(messages)/[conversation]",
                  params: {
                    conversation: data.conversation.conversationId,
                    userId: inviteData.userId.toString(),
                  },
                });
              },
            },
          );
        } else {
          // Handle error
          console.error("Failed to create invitation");
        }
      }
    } catch (error) {
      console.error("Error creating contact:", error);
    } finally {
      setIsCreatingContact(false);
    }
  };

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
            />
          </Input>
          <ThemedText type="defaultSemiBold" className="mb-2">
            Contacts
          </ThemedText>
          // Add in your component, under the search input
          <VStack className="mb-4">
            <ThemedText type="defaultSemiBold" className="mb-2">
              New Contact
            </ThemedText>
            <Input className="rounded-2xl border mb-2">
              <InputField
                placeholder="Contact Email Address"
                value={newContactEmail}
                onChangeText={setNewContactEmail}
              />
            </Input>
            <Button
              className="rounded-md"
              onPress={handleCreateNewContact}
              disabled={!isValidEmail(newContactEmail) || isCreatingContact}
            >
              <ButtonText>
                {isCreatingContact ? "Creating..." : "Create New Contact"}
              </ButtonText>
            </Button>
          </VStack>
          <Divider className="mb-4" />
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
