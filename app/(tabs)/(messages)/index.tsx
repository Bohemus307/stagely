import React, { useState, useCallback } from "react";
import { View, Text } from "react-native";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import MessagesList from "@/components/message/list";
import InvitationBanner from "@/components/InvitationBanner";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { SearchIcon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";

const MESSAGE_FILTER_OPTIONS = [
  { label: "All", value: null },
  { label: "Unread", value: "Unread" },
  { label: "Urgent", value: "Urgent" },
];

const MessagesScreen = () => {
  const { backendUser } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isBannerHidden, setIsBannerHidden] = useState(false);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleStatusFilterChange = useCallback((status: string | null) => {
    setStatusFilter(status);
  }, []);

  const handleBannerHide = useCallback(() => {
    setIsBannerHidden(true);
  }, []);

  const showInvitationBanner = backendUser?.isPlaceholder && !isBannerHidden;

  return (
    <ResponsiveScreenWrapper scrollable={false} withKeyboardAvoid={false}>
      {/* Search Input */}
      <View className="px-4 pt-2 pb-4 bg-white">
        <Input className="rounded-2xl border border-gray-400 bg-gray-100 mb-4">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            className="placeholder:text-gray-700"
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Input>

        {/* Filter Badges */}
        {MESSAGE_FILTER_OPTIONS.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {MESSAGE_FILTER_OPTIONS.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => handleStatusFilterChange(item.value)}
                className={`px-3 py-1.5 rounded-full border ${
                  statusFilter === item.value ||
                  (statusFilter === null && item.value === null)
                    ? "bg-primary-500 border-primary-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm ${
                    statusFilter === item.value ||
                    (statusFilter === null && item.value === null)
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Invitation Banner - only shows for placeholder users */}
      {showInvitationBanner && <InvitationBanner onHide={handleBannerHide} />}

      {/* Messages List */}
      <View className="flex-1">
        <MessagesList searchQuery={searchQuery} statusFilter={statusFilter} />
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default MessagesScreen;
