import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";
import { useAuthUser } from "@/hooks/useAuthUser";
import { router } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { useEditUser, UserUpdateData } from "@/hooks/profile/useEditUser";
import ProfileEdit from "@/components/profile/ProfileEditForm";

const EditProfileScreen = () => {
  const {
    backendUser,
    isLoading: userLoading,
    error: userError,
  } = useAuthUser();

  // Use an empty string as fallback if ID is undefined
  const userId = backendUser?.id ? backendUser.id.toString() : "";

  const {
    updateEditUser,
    isPending: isUpdating,
    error: updateError,
  } = useEditUser(userId);

  // Add type annotation for updatedData
  const handleSaveProfile = async (updatedData: UserUpdateData) => {
    updateEditUser(updatedData, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  if (userLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </View>
    );
  }

  if (userError || !backendUser) {
    return (
      <View className="flex-1 justify-center items-center">
        <ThemedText className="text-center mb-4">
          {userError
            ? `Error loading profile: ${userError.message}`
            : "User profile not found"}
        </ThemedText>
        <Button onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
        >
          <ScrollView className="bg-primary-50">
            <HStack className="items-center px-4 py-2">
              <BackButton />
            </HStack>

            <ProfileEdit
              userData={backendUser}
              onSave={handleSaveProfile}
              isSaving={isUpdating}
              error={updateError?.message}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default EditProfileScreen;
