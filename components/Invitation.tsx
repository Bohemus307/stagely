import React from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button, ButtonText } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";

// Hook to accept invitation automatically for placeholder users
import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

const useAutoAcceptInvitation = () => {
  const { getCredentials } = useAuth0();
  const { backendUser } = useAuthUser();
  const queryClient = useQueryClient();
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  return useMutation({
    mutationFn: async () => {
      console.log("=== AUTO ACCEPT INVITATION DEBUG ===");
      console.log("1. API URL:", apiUrl);
      console.log("2. Backend user:", JSON.stringify(backendUser, null, 2));

      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      if (!backendUser || !backendUser.id) {
        throw new Error("Backend user ID not available, please login again");
      }

      // Check if user has an invitation token in their record
      if (!backendUser.invitationToken) {
        throw new Error("No invitation token found for this user");
      }

      // Get the access token
      const credentials = await getCredentials();
      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      console.log("3. Using invitation token from user record");
      console.log("4. Making accept invitation request...");

      // Accept the invitation using the token from the user's record
      const response = await fetch(
        `https://${apiUrl}/users/accept-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify({
            token: backendUser.invitationToken,
          }),
        },
      );

      console.log("5. Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("6. Error response:", errorText);
        throw new Error(
          `Failed to accept invitation: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("7. Success response:", JSON.stringify(result, null, 2));

      return result;
    },
    onSuccess: (data) => {
      console.log("Invitation accepted successfully");
      // Invalidate user queries to refetch updated user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Failed to accept invitation:", error);
    },
  });
};

const InvitationFlow: React.FC = () => {
  const {
    backendUser,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useAuthUser();

  const { mutate: acceptInvitation, isPending: isAcceptingInvitation } =
    useAutoAcceptInvitation();

  // Helper function to check if user is placeholder
  const isUserPlaceholder = backendUser?.isPlaceholder === true;

  const handleAcceptInvitation = () => {
    if (!backendUser) {
      Alert.alert("Error", "User information not available");
      return;
    }

    if (!backendUser.invitationToken) {
      Alert.alert(
        "Error",
        "No invitation found for your account. Please contact support.",
      );
      return;
    }

    acceptInvitation(undefined, {
      onSuccess: async () => {
        Alert.alert(
          "Welcome!",
          "Your account has been activated successfully. You can now send and receive messages.",
          [
            {
              text: "Get Started",
              onPress: async () => {
                // Refetch user data to get updated info
                await refetchUser();
                // Navigate to messages
                router.replace("/(tabs)/(messages)");
              },
            },
          ],
        );
      },
      onError: (error) => {
        Alert.alert(
          "Activation Failed",
          `We couldn't activate your account: ${error.message}. Please try again or contact support.`,
        );
      },
    });
  };

  if (isLoadingUser) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0056b3" />
        <ThemedText className="mt-4">Loading user information...</ThemedText>
      </ThemedView>
    );
  }

  // If user is not a placeholder, they don't need to accept an invitation
  if (backendUser && !isUserPlaceholder) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-4">
        <ThemedText type="title" className="text-center mb-4">
          Account Already Active
        </ThemedText>
        <ThemedText className="text-center mb-6 text-gray-600">
          Your account is already fully activated. You can start using the app.
        </ThemedText>
        <Button
          className="px-6 py-3 rounded-lg"
          onPress={() => router.replace("/(tabs)/(messages)")}
        >
          <ButtonText>Go to Messages</ButtonText>
        </Button>
      </ThemedView>
    );
  }

  // If no backend user found
  if (!backendUser) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-4">
        <ThemedText type="title" className="text-center mb-4">
          Account Not Found
        </ThemedText>
        <ThemedText className="text-center mb-6 text-gray-600">
          We couldn't find your account. Please try logging in again.
        </ThemedText>
        <Button className="px-6 py-3 rounded-lg" onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </Button>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 p-4">
      <View className="flex-1 justify-center">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4">
            <ThemedText className="text-4xl">🎉</ThemedText>
          </View>

          <ThemedText type="title" className="text-center mb-4">
            Welcome to Stagely!
          </ThemedText>

          <ThemedText className="text-center mb-2 text-gray-600">
            You've been invited to join Stagely.
          </ThemedText>

          <ThemedText className="text-center mb-6 text-gray-600">
            Click the button below to activate your account and start messaging.
          </ThemedText>
        </View>

        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <ThemedText className="text-sm text-gray-600 mb-2">
            Account Details:
          </ThemedText>
          <ThemedText className="font-semibold">
            📧 {backendUser.email}
          </ThemedText>
          {backendUser.invitationToken && (
            <ThemedText className="text-xs text-gray-500 mt-1">
              ✅ Invitation ready to activate
            </ThemedText>
          )}
        </View>

        <Button
          className="px-6 py-4 rounded-lg mb-4"
          onPress={handleAcceptInvitation}
          disabled={isAcceptingInvitation || !backendUser.invitationToken}
        >
          {isAcceptingInvitation ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" className="mr-2" />
              <ButtonText>Activating Account...</ButtonText>
            </View>
          ) : (
            <ButtonText>Activate My Account</ButtonText>
          )}
        </Button>

        {!backendUser.invitationToken && (
          <View className="bg-yellow-50 p-4 rounded-lg mb-4">
            <ThemedText className="text-yellow-800 text-sm text-center">
              ⚠️ No invitation token found. Please contact the person who
              invited you.
            </ThemedText>
          </View>
        )}

        <Button
          variant="outline"
          className="px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <ButtonText>Maybe Later</ButtonText>
        </Button>

        <View className="mt-8 p-4 bg-gray-100 rounded-lg">
          <ThemedText className="text-xs text-gray-600 text-center">
            Need help? Contact support or the person who invited you to Stagely.
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
};

export default InvitationFlow;
