// components/InvitationBanner.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useAcceptInvitation } from "@/hooks/messaging/useAcceptInvitation";

interface InvitationBannerProps {
  onActivate?: () => void;
  onHide?: () => void;
}

const InvitationBanner: React.FC<InvitationBannerProps> = ({
  onActivate,
  onHide,
}) => {
  const { backendUser, refetch: refetchUser } = useAuthUser();
  const { mutate: acceptInvitation, isPending: isAccepting } =
    useAcceptInvitation();
  const [isHidden, setIsHidden] = useState(false);

  // Don't show banner if user is not a placeholder or if manually hidden
  if (!backendUser?.isPlaceholder || isHidden) {
    return null;
  }

  const handleActivate = () => {
    if (onActivate) {
      onActivate();
      return;
    }

    // Use the auto-activation if user has a token
    if (backendUser.invitationToken) {
      acceptInvitation(
        { token: backendUser.invitationToken },
        {
          onSuccess: async () => {
            Alert.alert(
              "Welcome! 🎉",
              "Your account has been activated successfully!",
              [
                {
                  text: "Start Messaging",
                  onPress: async () => {
                    await refetchUser();
                    setIsHidden(true);
                    if (onHide) onHide();
                  },
                },
              ],
            );
          },
          onError: (error) => {
            Alert.alert(
              "Activation Failed",
              `We couldn't activate your account: ${error.message}. Please try again.`,
            );
          },
        },
      );
    } else {
      // Fallback to navigation if no token
      router.push("/accept-invitation");
    }
  };

  const handleDismiss = () => {
    setIsHidden(true);
    if (onHide) onHide();
  };

  return (
    <View className="mx-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <ThemedText className="font-semibold text-yellow-800 mb-1">
            🎉 Activate Your Account
          </ThemedText>
          <ThemedText className="text-sm text-yellow-700">
            Complete your setup to start messaging and unlock all features
          </ThemedText>
        </View>

        <View className="flex-row items-center space-x-2">
          {/* Dismiss button */}
          <TouchableOpacity
            className="p-2"
            onPress={handleDismiss}
            disabled={isAccepting}
          >
            <ThemedText className="text-yellow-600 text-lg">×</ThemedText>
          </TouchableOpacity>

          {/* Activate button */}
          <TouchableOpacity
            className="bg-yellow-500 px-4 py-2 rounded-lg flex-row items-center"
            onPress={handleActivate}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <ThemedText className="text-white font-semibold text-sm ml-2">
                  Activating...
                </ThemedText>
              </>
            ) : (
              <ThemedText className="text-white font-semibold text-sm">
                Activate Now
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Optional: Show email for confirmation */}
      {backendUser.email && (
        <View className="mt-2 pt-2 border-t border-yellow-200">
          <ThemedText className="text-xs text-yellow-600">
            📧 {backendUser.email}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

export default InvitationBanner;
