import { ThemedText } from "@/components/ThemedText";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { router } from "expo-router";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import { ActivityIndicator, FlatList, View, Alert } from "react-native";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icon";
import { useCreateConversation } from "@/hooks/messaging/useCreateConversation";
import { useInviteConversation } from "@/hooks/messaging/useInviteConversation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useGetConversations } from "@/hooks/messaging/useConversations"; // Fixed import path
import { User } from "@/components/message/data/messages";

const NewMessageScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState<"search" | "invite">(
    "search",
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { backendUser, isLoading: isLoadingUser } = useAuthUser();

  // Get user's existing conversations to filter previously messaged users
  const { conversations, isLoading: isLoadingConversations } =
    useGetConversations();

  // Remove unused allUsers - we only search previously messaged users now

  const { mutate: createConversation, isPending: isCreatingConversation } =
    useCreateConversation();

  const { mutate: inviteConversation, isPending: isInviting } =
    useInviteConversation();

  // Extract previously messaged users from conversations
  const previouslyMessagedUsers = useMemo(() => {
    if (!conversations || !backendUser?.id) return [];

    const users: User[] = [];
    const seenUserIds = new Set<number>();

    conversations.forEach((conversation: any) => {
      // Get the other participant(s) from the conversation
      if (
        conversation.otherParticipant &&
        conversation.otherParticipant.id !== backendUser.id
      ) {
        const otherUser = conversation.otherParticipant;
        if (!seenUserIds.has(otherUser.id)) {
          seenUserIds.add(otherUser.id);
          users.push({
            id: otherUser.id,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            email: otherUser.email,
            profilePictureUrl: otherUser.profilePictureUrl,
          });
        }
      }

      // If conversation has participant data in other formats, handle those too
      if (conversation.participantNames && conversation.participants) {
        conversation.participants.forEach(
          (participantId: number, index: number) => {
            if (
              participantId !== backendUser.id &&
              !seenUserIds.has(participantId)
            ) {
              seenUserIds.add(participantId);
              users.push({
                id: participantId,
                firstName: conversation.participantNames[index] || "User",
                lastName: "",
                email: conversation.participantEmails?.[index] || "",
                profilePictureUrl:
                  conversation.participantAvatars?.[index] || "",
              });
            }
          },
        );
      }
    });

    return users;
  }, [conversations, backendUser?.id]);

  // Filter previously messaged users based on search query
  const filteredPreviousUsers = useMemo(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      return previouslyMessagedUsers;
    }

    const query = debouncedSearch.toLowerCase();
    return previouslyMessagedUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return (
        fullName.includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
      );
    });
  }, [previouslyMessagedUsers, debouncedSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2 && selectedMode === "search") {
        setDebouncedSearch(searchQuery.trim());
      } else {
        setDebouncedSearch("");
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedMode]);

  const isEmailLike = useCallback((query: string) => {
    return query.includes("@") && query.includes(".");
  }, []);

  const handleUserSelect = useCallback(
    (user: User) => {
      if (!backendUser?.id) {
        Alert.alert(
          "Error",
          "User information not available. Please login again.",
        );
        return;
      }

      const requestParams = {
        userId: backendUser.id,
        participants: [user.id],
        initialMessage: initialMessage.trim() || undefined,
      };

      createConversation(requestParams, {
        onSuccess: (data: any) => {
          if (data?.success === false) {
            Alert.alert("Error", data.error || "Failed to create conversation");
            return;
          }

          const conversationId =
            data?.conversation?.conversationId ||
            data?.conversationId ||
            (data?.conversation && typeof data.conversation === "string"
              ? data.conversation
              : null);

          if (conversationId) {
            router.push({
              pathname: "/(tabs)/(messages)/[conversation]",
              params: {
                conversation: conversationId,
                userId: user.id.toString(),
              },
            });
          } else {
            console.error("No conversation ID in response:", data);
            Alert.alert(
              "Error",
              "Could not create conversation. Missing conversation ID. Please try again.",
            );
          }
        },
        onError: (error: Error) => {
          console.error("Failed to create conversation:", error);
          Alert.alert(
            "Error",
            `Failed to create conversation: ${error.message}`,
          );
        },
      });
    },
    [backendUser?.id, initialMessage, createConversation],
  );

  // Handle inviting a new user by email
  const handleEmailInvite = useCallback(() => {
    if (!isEmailLike(searchQuery.trim())) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address to send an invitation.",
      );
      return;
    }

    const email = searchQuery.trim();

    inviteConversation(
      {
        email: email,
        initialMessage: initialMessage.trim() || undefined,
      },
      {
        onSuccess: (data: any) => {
          Alert.alert(
            "Invitation Sent",
            `An invitation has been sent to ${email}. They will receive your message once they accept the invitation.`,
            [
              {
                text: "OK",
                onPress: () => {
                  router.back();
                },
              },
            ],
          );
        },
        onError: (error: Error) => {
          console.error("Failed to send invitation:", error);
          Alert.alert("Error", `Failed to send invitation: ${error.message}`);
        },
      },
    );
  }, [searchQuery, initialMessage, inviteConversation, isEmailLike]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);

      // Auto-switch mode based on input
      if (isEmailLike(text.trim())) {
        setSelectedMode("invite");
      } else {
        setSelectedMode("search");
      }
    },
    [isEmailLike],
  );

  if (isLoadingUser || isLoadingConversations) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0056b3" />
        <ThemedText className="mt-4">Loading user information...</ThemedText>
      </ThemedView>
    );
  }

  // Filter out placeholder users (invited but not joined)
  const filteredUsers =
    selectedMode === "search"
      ? filteredPreviousUsers.filter((user: User) => {
          const isPlaceholder =
            user.firstName === "Invited" && user.lastName === "User";
          return !isPlaceholder;
        })
      : [];

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      className="p-2 mb-2 bg-white rounded-lg shadow-sm"
      onPress={() => handleUserSelect(item)}
      disabled={isCreatingConversation || isInviting}
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
        {(isCreatingConversation || isInviting) && (
          <ActivityIndicator size="small" color="#0056b3" />
        )}
      </HStack>
    </Pressable>
  );

  const renderEmailInvite = () => {
    if (selectedMode !== "invite" || !isEmailLike(searchQuery.trim())) {
      return null;
    }

    return (
      <Pressable
        className="p-4 mb-2 bg-blue-50 rounded-lg border border-blue-200"
        onPress={handleEmailInvite}
        disabled={isInviting || isCreatingConversation}
      >
        <HStack className="items-center">
          <Avatar size="sm" className="mr-3 bg-blue-500">
            <AvatarFallbackText className="text-white">
              {searchQuery.trim().charAt(0).toUpperCase()}
            </AvatarFallbackText>
          </Avatar>
          <View className="flex-1">
            <ThemedText type="defaultSemiBold" className="text-blue-700">
              Invite {searchQuery.trim()}
            </ThemedText>
            <ThemedText className="text-sm text-blue-600">
              Send an invitation to this email address
            </ThemedText>
          </View>
          {(isInviting || isCreatingConversation) && (
            <ActivityIndicator size="small" color="#0056b3" />
          )}
        </HStack>
      </Pressable>
    );
  };

  const renderEmptyState = () => {
    if (isInviting || isCreatingConversation) {
      return null;
    }

    if (selectedMode === "invite" && isEmailLike(searchQuery.trim())) {
      return null;
    }

    if (searchQuery.length >= 2 && selectedMode === "search") {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <ThemedText className="text-gray-500 text-center">
            No previously messaged users found matching "{searchQuery}"
          </ThemedText>
          {isEmailLike(searchQuery.trim()) && (
            <ThemedText className="text-blue-500 text-center mt-2">
              Try sending an invitation to this email address instead
            </ThemedText>
          )}
        </View>
      );
    }

    if (searchQuery.length > 0 && searchQuery.length < 2) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <ThemedText className="text-gray-500 text-center">
            Enter at least 2 characters to search
          </ThemedText>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center py-8">
        <ThemedText className="text-gray-500 text-center">
          {previouslyMessagedUsers.length === 0
            ? "No previous conversations found. Enter an email to invite someone new."
            : "Search for someone you've previously messaged"}
        </ThemedText>
        <ThemedText className="text-gray-400 text-center mt-2 text-sm">
          Enter an email address to send an invitation to someone new
        </ThemedText>
      </View>
    );
  };

  const isProcessing = isCreatingConversation || isInviting;

  return (
    <ThemedView className="flex-1 p-2">
      <SafeAreaView className="flex-1">
        <BackButton />
        <View className="flex-row items-center px-4 mb-2">
          <ThemedText type="defaultSemiBold">
            Send A Message or Invite someone new!
          </ThemedText>
        </View>

        <View className="p-4 flex-1">
          {/* Search Input */}
          <Input className="rounded-2xl border border-gray-400 bg-gray-100 mb-4">
            <InputSlot className="pl-3">
              {isLoadingConversations ? (
                <ActivityIndicator size="small" color="#0056b3" />
              ) : (
                <InputIcon as={SearchIcon} />
              )}
            </InputSlot>
            <InputField
              className="placeholder:text-gray-700"
              placeholder="Search users or enter email to invite..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              editable={!isProcessing}
            />
          </Input>

          {/* Initial Message Input */}
          <Input className="rounded-2xl border border-gray-400 bg-gray-100 mb-4">
            <InputField
              className="placeholder:text-gray-700 ml-8 mt-4"
              placeholder="Intial Message...."
              value={initialMessage}
              onChangeText={setInitialMessage}
              multiline
              editable={!isProcessing}
            />
          </Input>

          {/* Mode Indicator */}
          <View className="mb-2 flex-row items-center">
            <ThemedText type="defaultSemiBold">
              {selectedMode === "invite"
                ? "Send Invitation"
                : "Previously messaged users"}
            </ThemedText>
            {selectedMode === "invite" && (
              <View className="ml-2 px-2 py-1 bg-blue-100 rounded">
                <ThemedText className="text-xs text-blue-700">
                  Invite Mode
                </ThemedText>
              </View>
            )}
          </View>

          {/* Results List */}
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={renderEmailInvite}
            ListEmptyComponent={renderEmptyState}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
};

export default NewMessageScreen;
