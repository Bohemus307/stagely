import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import {
  ActivityIndicator,
  FlatList,
  View,
  TouchableOpacity,
} from "react-native";
import { AddIcon } from "@/components/ui/icon";
import { useAuthUser } from "@/hooks/useAuthUser";
import { usePreviouslyMessagedUsers } from "@/hooks/messaging/usePreviouslyMessagedUsers";
import { User } from "@/lib/@types/messages";
import MessageCard from "@/components/message/list/MessageCard";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Fab, FabIcon } from "@/components/ui/fab";

const NewMessageScreen = () => {
  const { backendUser, isLoading: isLoadingUser } = useAuthUser();

  const {
    data: previousUsersData,
    isLoading: isLoadingContacts,
    error: contactsError,
    refetch,
  } = usePreviouslyMessagedUsers("", true);

  const handleContactPress = (user: User) => {
    router.push({
      pathname: "/(tabs)/(messages)/[conversation]",
      params: {
        conversation: user.conversationId || `${backendUser?.id}-${user.id}`,
        userId: user.id.toString(),
      },
    });
  };

  const handleInvitePress = () => {
    router.push("/(tabs)/(messages)/invite");
  };

  const renderContactItem = ({ item }: { item: User }) => {
    const messageData = {
      id: item.conversationId || `contact-${item.id}`,
      user: {
        id: item.id.toString(),
        name: `${item.firstName} ${item.lastName}`,
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        avatar: item.profilePictureUrl,
      },
      lastMessage: item.lastMessage || "Start a conversation...",
      timestamp: item.lastMessageTime || new Date().toISOString(),
      unread: false,
    };

    return (
      <View className="mb-2">
        <MessageCard
          message={messageData}
          onPress={() => handleContactPress(item)}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center p-8">
      <IconSymbol
        name="person.2.fill"
        size={48}
        color={Colors.light.tabIconDefault}
      />
      <ThemedText className="text-center mt-4 text-lg font-medium">
        No Contacts Yet
      </ThemedText>
      <ThemedText className="text-center mt-2 text-gray-600">
        Start by inviting someone
      </ThemedText>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center p-4">
      <IconSymbol name="exclamationmark.triangle.fill" size={48} color="red" />
      <ThemedText className="text-center mt-4 text-red-600">
        Error loading contacts
      </ThemedText>
      <ThemedText className="text-center mt-2 text-sm">
        {contactsError?.message}
      </ThemedText>
      <TouchableOpacity
        className="bg-primary-500 rounded-lg px-4 py-2 mt-4"
        onPress={() => refetch()}
      >
        <ThemedText className="text-white font-medium">Try Again</ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (isLoadingUser) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <ThemedText className="mt-4">Loading user information...</ThemedText>
      </ThemedView>
    );
  }

  const contacts = previousUsersData?.users || [];

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-2 py-2 border-b border-gray-200">
          <BackButton />
          <ThemedText className="text-lg font-medium text-center flex-1 mr-12">
            Contacts
          </ThemedText>
        </View>

        {/* Content */}
        <View className="flex-1 px-4 pt-4">
          {isLoadingContacts && contacts.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={Colors.light.tint} />
              <ThemedText className="mt-4">Loading contacts...</ThemedText>
            </View>
          ) : contactsError ? (
            renderErrorState()
          ) : (
            <FlatList
              data={contacts}
              renderItem={renderContactItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{
                paddingBottom: 100, // Extra space for FAB
                flexGrow: 1,
              }}
              ListEmptyComponent={renderEmptyState}
              refreshing={isLoadingContacts}
              onRefresh={refetch}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Floating Action Button for Invite */}
        <Fab
          size="md"
          placement="bottom right"
          className="bg-primary-500 mr-4 mb-10"
          onPress={handleInvitePress}
        >
          <FabIcon as={AddIcon} className="text-white" />
        </Fab>
      </SafeAreaView>
    </ThemedView>
  );
};

export default NewMessageScreen;
