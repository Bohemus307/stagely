import { ThemedText } from "@/components/ThemedText";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { properties } from "@/components/properties/data/properties";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import { FlatList, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icon";
import { MessageUser, mockUsers } from "@/components/message/data/messages";
import { Property } from "@/lib/@types/properties";

const NewMessageScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<MessageUser[]>(
    Object.values(mockUsers),
  );
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<MessageUser | null>(null);
  const [showPropertySelection, setShowPropertySelection] = useState(false);

  //Filter users based on search query
  useEffect(() => {
    if (!showPropertySelection) {
      if (searchQuery.trim() === "") {
        setFilteredUsers(Object.values(mockUsers));
      } else {
        const lowercaseQuery = searchQuery.toLowerCase();
        const filtered = Object.values(mockUsers).filter((user) =>
          user.name.toLowerCase().includes(lowercaseQuery),
        );
        setFilteredUsers(filtered);
      }
    }
  }, [searchQuery, showPropertySelection]);

  const handleUserSelect = (user: MessageUser) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    setShowPropertySelection(true);
    setSearchQuery("");
  };

  const handlePropertySelect = (propertyId: number) => {
    if (selectedUserId) {
      router.push({
        pathname: "/(tabs)/(messages)/[conversation]",
        params: {
          conversation: selectedUserId,
          userId: selectedUserId,
          propertyId: propertyId.toString(),
        },
      });
    }
  };

  const handleSkipPropertySelection = () => {
    if (selectedUserId) {
      router.push({
        pathname: "/(tabs)/(messages)/[conversation]",
        params: {
          conversation: selectedUserId,
          userId: selectedUserId,
        },
      });
    }
  };

  const renderUserItem = ({ item }: { item: MessageUser }) => (
    <Pressable
      className="p-2 mb-2 bg-white rounded-lg shadow-sm"
      onPress={() => handleUserSelect(item)}
    >
      <HStack className="items-center">
        <Avatar size="sm" className="mr-3">
          {item.avatar ? (
            <AvatarImage source={{ uri: item.avatar }} />
          ) : (
            <AvatarFallbackText>{item.name.charAt(0)}</AvatarFallbackText>
          )}
        </Avatar>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
      </HStack>
    </Pressable>
  );

  const renderPropertyItem = ({ item }: { item: Property }) => (
    <Pressable
      className="p-3 mb-2 bg-white rounded-lg shadow-sm"
      onPress={() => handlePropertySelect(item.id)}
    >
      <HStack className="items-center justify-between">
        <VStack>
          <ThemedText type="defaultSemiBold">{item.address}</ThemedText>
          <ThemedText type="default">
            {item.city}, {item.state} {item.zipCode}
          </ThemedText>
        </VStack>

        <Badge
          className={
            item.status === "Active"
              ? "bg-green-400/80"
              : item.status === "Maintenance"
                ? "bg-amber-400/80"
                : "bg-gray-400/80"
          }
        >
          <ThemedText>{item.status}</ThemedText>
        </Badge>
      </HStack>
    </Pressable>
  );

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        <BackButton />
        <View className="flex-row items-center px-4">
          <ThemedText type="defaultSemiBold">
            {showPropertySelection ? "New Message" : "New Message"}
          </ThemedText>
        </View>

        {showPropertySelection ? (
          <View className="p-4 flex-1">
            {selectedUser && (
              <HStack className="items-center mb-4">
                <Avatar size="sm" className="mr-2">
                  {selectedUser.avatar ? (
                    <AvatarImage source={{ uri: selectedUser.avatar }} />
                  ) : (
                    <AvatarFallbackText>
                      {selectedUser.name.charAt(0)}
                    </AvatarFallbackText>
                  )}
                </Avatar>
                <ThemedText>Messaging {selectedUser.name}</ThemedText>
              </HStack>
            )}

            <ThemedText type="defaultSemiBold" className="mb-2">
              Select a Property (Optional)
            </ThemedText>

            <FlatList
              data={
                properties.filter(
                  (p) => p.status !== "Archived",
                ) as unknown as Property[]
              } //FIX ME too 🌵
              renderItem={renderPropertyItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListHeaderComponent={
                <Button
                  className="mb-4 p-3 bg-white rounded-lg border border-gray-300"
                  variant="outline"
                  onPress={handleSkipPropertySelection}
                >
                  <HStack className="h-20 items-center justify-center w-full">
                    <ThemedText className="text-primary-700">
                      Skip - No Property
                    </ThemedText>
                  </HStack>
                </Button>
              }
            />
          </View>
        ) : (
          <View className="p-4 flex-1">
            <Input className="rounded-2xl border mb-4">
              <InputSlot className="pl-3">
                <InputIcon as={SearchIcon} />
              </InputSlot>
              <InputField
                placeholder="Search for a Contact..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </Input>
            <ThemedText type="defaultSemiBold">Contacts</ThemedText>

            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        )}
      </SafeAreaView>
    </ThemedView>
  );
};

export default NewMessageScreen;
