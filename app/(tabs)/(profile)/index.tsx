import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Alert, View } from "react-native";
import ProfileHeader from "@/components/profile/details/ProfileHeader";
import ProfileMenuItem from "@/components/profile/details/ProfileMenuItem";
import { Spinner } from "@/components/ui/spinner";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useAuth0 } from "react-native-auth0";
import { User } from "@/lib/@types/properties";
import { useDeleteUser } from "@/hooks/profile/useDeleteUser";

const ProfileScreen = () => {
  const { auth0User, backendUser: user, isLoading } = useAuthUser();
  const { clearSession } = useAuth0();
  const {
    deleteUser,
    isPending: isDeletingAccount,
    isSuccess: isDeleteSuccess,
    isError: isDeleteError,
    error: deleteError,
    reset: resetDeleteMutation,
  } = useDeleteUser();

  useEffect(() => {
    if (isDeleteSuccess) {
      Alert.alert(
        "Account Deleted",
        "Your account has been successfully deleted. You will now be logged out.",
        [
          {
            text: "OK",
            onPress: async () => {
              resetDeleteMutation();
              try {
                await clearSession();
                router.replace("/");
              } catch (error) {
                console.error("Error during logout after deletion:", error);
                router.replace("/");
              }
            },
          },
        ],
      );
    }
  }, [isDeleteSuccess, clearSession, resetDeleteMutation]);

  useEffect(() => {
    if (isDeleteError && deleteError) {
      Alert.alert(
        "Delete Failed",
        deleteError?.message ||
          "Failed to delete account. Please try again later.",
      );
      resetDeleteMutation();
    }
  }, [isDeleteError, deleteError, resetDeleteMutation]);

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  if (!auth0User) {
    router.replace("/");
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  const handleLogout = async () => {
    try {
      await clearSession();
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone. All your data including properties, incidents, and messages will be permanently removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ],
    );
  };

  const confirmDeleteAccount = () => {
    if (!user?.id) {
      Alert.alert("Error", "Unable to delete account: User ID not available");
      return;
    }

    deleteUser(user.id.toString());
  };

  const navigateToNotifications = () => {
    console.log("To Notifications Button Pushed");
  };

  const navigateToHelp = () => {
    console.log("Help Button Pushed");
  };

  const navigateToEditProfile = () => {
    router.push("/(tabs)/(profile)/edit");
  };

  return (
    <ResponsiveScreenWrapper>
      <View className="flex-1">
        <View className="mt-4 shadow-sm">
          <View className="">
            {user && (
              <ProfileHeader
                user={user as User}
                fallbackPicture={auth0User?.picture}
              />
            )}
          </View>
        </View>

        <View className="pb-14">
          <Box>
            {/* Account Settings Section */}
            <ThemedText type="defaultSemiBold" className="px-5 pt-2">
              ACCOUNT SETTINGS
            </ThemedText>

            <ProfileMenuItem
              iconName="person.circle.fill"
              title="Edit Profile"
              onPress={navigateToEditProfile}
            />

            <ProfileMenuItem
              iconName="bell.fill"
              title="Notifications"
              onPress={navigateToNotifications}
            />

            {/* Support Section */}
            <ThemedText type="defaultSemiBold" className="px-5 pt-2">
              SUPPORT
            </ThemedText>
            <ProfileMenuItem
              iconName="circle.badge.questionmark"
              title="Help Center"
              onPress={navigateToHelp}
            />

            <ProfileMenuItem
              iconName="trash.fill"
              title={
                isDeletingAccount ? "Deleting Account..." : "Delete Account"
              }
              onPress={isDeletingAccount ? () => {} : handleDeleteAccount}
            />

            <ProfileMenuItem
              iconName="square.and.arrow.up.on.square"
              title="Log Out"
              onPress={handleLogout}
            />
          </Box>
        </View>
      </View>
    </ResponsiveScreenWrapper>
  );
};

export default ProfileScreen;
