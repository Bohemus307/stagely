import React, { useState, useCallback, useMemo } from "react";
import { View } from "react-native";
import MessagesList from "@/components/message/list";
import InvitationBanner from "@/components/InvitationBanner";
import { useAuthUser } from "@/hooks/useAuthUser";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import MessageSearch from "@/components/message/search";
import { useFocusEffect } from "@react-navigation/native";

const MessagesScreen = () => {
  const { backendUser } = useAuthUser();

  const [submittedQuery, setSubmittedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isBannerHidden, setIsBannerHidden] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      console.log("📱 Messages screen focused - resetting search");

      setSubmittedQuery("");
      setStatusFilter(null);
      setResetKey((prev) => prev + 1);
    }, []),
  );

  const handleSearchSubmit = useCallback((query: string) => {
    setSubmittedQuery(query);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSubmittedQuery("");
  }, []);

  const handleStatusFilterChange = useCallback((status: string | null) => {
    setStatusFilter(status);
  }, []);

  const handleBannerHide = useCallback(() => {
    setIsBannerHidden(true);
  }, []);

  const showInvitationBanner = useMemo(() => {
    return backendUser?.isPlaceholder && !isBannerHidden;
  }, [backendUser?.isPlaceholder, isBannerHidden]);

  return (
    <ResponsiveScreenWrapper scrollable={false}>
      <View className="flex-1">
        {/* Search Component */}
        <View className="px-4 py-2 bg-white">
          <MessageSearch
            key={resetKey}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
          />
        </View>

        {/* Invitation Banner */}
        {showInvitationBanner && (
          <View className="px-4">
            <InvitationBanner onHide={handleBannerHide} />
          </View>
        )}

        {/* Messages List */}
        <View className="flex-1">
          <MessagesList
            searchQuery={submittedQuery}
            statusFilter={statusFilter}
          />
        </View>
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default MessagesScreen;
