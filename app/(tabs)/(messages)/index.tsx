import React, { useState } from "react";
import { View } from "react-native";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import MessagesList from "@/components/message/list";
import MessageSearch from "@/components/message/search";
import InvitationBanner from "@/components/InvitationBanner";
import { useAuthUser } from "@/hooks/useAuthUser";

const MessagesScreen = () => {
  const { backendUser } = useAuthUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isBannerHidden, setIsBannerHidden] = useState(false);

  // Show banner only for placeholder users who haven't dismissed it
  const showInvitationBanner = backendUser?.isPlaceholder && !isBannerHidden;

  return (
    <ResponsiveScreenWrapper scrollable={false}>
      {/* Search Component */}
      <View className="px-4 p-2 bg-white">
        <MessageSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </View>

      {/* Invitation Banner - only shows for placeholder users */}
      {showInvitationBanner && (
        <InvitationBanner onHide={() => setIsBannerHidden(true)} />
      )}

      {/* Messages List */}
      <View className="flex-1">
        <MessagesList searchQuery={searchQuery} statusFilter={statusFilter} />
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default MessagesScreen;
