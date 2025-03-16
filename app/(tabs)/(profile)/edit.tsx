import React, { useState } from "react";
import { useAuth0 } from "react-native-auth0";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import BackButton from "@/components/BackButton";
import { Box } from "@/components/ui/box";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { VStack } from "@/components/ui/vstack";
import { ThemedText } from "@/components/ThemedText";

interface UserMetadata {
  properties?: number;
  teamMembers?: number;
  activeTasks?: number;
  phone?: string;
}

interface UserUpdatePayload {
  name?: string;
  user_metadata?: UserMetadata;
}

const EditProfile = () => {
  const { user, getCredentials } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get the Auth0 domain
  const AUTH0_DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;

  const redirectToAuth0Profile = () => {
    // Auth0 profile management URL - adjust as needed based on your Auth0 tenant setup
    const profileUrl = `https://${AUTH0_DOMAIN}/manage/profile`;

    Linking.canOpenURL(profileUrl).then((supported) => {
      if (supported) {
        Linking.openURL(profileUrl);
      } else {
        Alert.alert("Error", "Couldn't open the profile management page");
      }
    });
  };

  const saveProfile = async () => {
    if (!user) {
      Alert.alert("Error", "User data not available");
      return;
    }

    setSaving(true);
    try {
      //Get credentials
      const credentials = await getCredentials();
      if (!credentials || !credentials.accessToken) {
        throw new Error("Failed to get Access Token");
      }

      // Prepare the update payload
      const updatePayload: UserUpdatePayload = {
        user_metadata: {
          // Preserve existing metadata that shouldn't be modified here
          properties: (user.user_metadata as UserMetadata)?.properties,
          teamMembers: (user.user_metadata as UserMetadata)?.teamMembers,
          activeTasks: (user.user_metadata as UserMetadata)?.activeTasks,
        },
      };

      // Call API
      const response = await fetch(
        `https://${AUTH0_DOMAIN}/api/v2/users/${user.sub}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(updatePayload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0C4A6E" />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <BackButton />

          <Box className="items-center mt-4 mb-6">
            <Avatar size="xl" className="mb-2">
              {user?.picture ? (
                <AvatarImage source={{ uri: user.picture }} />
              ) : (
                <AvatarFallbackText>
                  {user?.name ? user.name.charAt(0) : "?"}
                </AvatarFallbackText>
              )}
            </Avatar>

            <Button
              variant="outline"
              className="mt-2 rounded-full bg-gray-100"
              onPress={() => Alert.alert("Coming Soon")}
            >
              <HStack className="items-center">
                <IconSymbol name="camera.fill" size={16} color={"gray"} />
                <ButtonText className="ml-2">Change Photo</ButtonText>
              </HStack>
            </Button>
          </Box>

          <VStack className="px-4 space-y-4">
            <Box className="bg-white p-4 rounded-lg">
              <ThemedText type="defaultSemiBold" className="mb-2">
                Profile Information
              </ThemedText>
              <ThemedText>Name: {user?.name}</ThemedText>
              <ThemedText>Email: {user?.email}</ThemedText>
              <ThemedText>Phone: {user?.phoneNumber}</ThemedText>
            </Box>

            <Button className="mt-6" onPress={redirectToAuth0Profile}>
              <HStack className="items-center">
                <IconSymbol name="pencil" size={16} color="white" />
                <ButtonText className="ml-2">Edit Profile</ButtonText>
              </HStack>
            </Button>

            <HStack className="space-x-4 mt-4 mb-10">
              <Button
                variant="outline"
                action="secondary"
                className="flex-1"
                onPress={() => router.back()}
                disabled={saving}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                className="flex-1"
                onPress={saveProfile}
                disabled={saving}
              >
                <ButtonText>{saving ? "Saving..." : "Save Changes"}</ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

export default EditProfile;
