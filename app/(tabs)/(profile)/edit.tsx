import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import ProfileEdit from "@/components/profile/ProfileEditForm";
import { useUpdateUser } from "@/hooks/profile/useUpdateUser";
import { UpdateUserData } from "@/hooks/profile/useUpdateUser";
import { useAuthUser } from "@/hooks/useAuthUser";

const EditProfileScreen = () => {
  const {
    backendUser: user,
    isLoading: userLoading,
    error: userError,
    refetch,
  } = useAuthUser();

  const userId = user?.id ? user.id.toString() : undefined;

  const {
    updateUser,
    isPending: isUpdating,
    isSuccess,
    isError,
    error: updateError,
    data: updateData,
    reset,
  } = useUpdateUser(userId);

  useEffect(() => {
    if (isSuccess) {
      refetch().then(() => {
        router.back();
      });
    }
  }, [isSuccess, updateData, refetch]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleSaveProfile = async (updatedData: UpdateUserData) => {
    if (!userId) {
      console.error("No user ID available for update");
      alert("Unable to update profile: User ID not available");
      return;
    }

    updateUser(updatedData);
  };

  if (userLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </View>
    );
  }

  if (userError || !user) {
    return (
      <View className="flex-1 justify-center items-center">
        <ThemedText className="text-center mb-4">
          {userError
            ? `Error loading profile: ${userError.message}`
            : "User profile not found"}
        </ThemedText>
        <Button onPress={() => refetch()}>
          <ButtonText>Retry</ButtonText>
        </Button>
        <Button className="mt-4" onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </Button>
      </View>
    );
  }

  return (
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
            userData={user}
            onSave={handleSaveProfile}
            isSaving={isUpdating}
            error={
              updateError?.message ||
              (isError ? "Failed to update profile" : undefined)
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
