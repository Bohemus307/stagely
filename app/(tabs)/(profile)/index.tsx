import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import ProfileHeader from "@/components/profile/details/ProfileHeader";
import ProfileMenuItem from "@/components/profile/details/ProfileMenuItem";
import { Spinner } from "@/components/ui/spinner";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useAuth0 } from "react-native-auth0";
import { User } from "@/lib/@types/properties";

const ProfileScreen = () => {
  const { auth0User, backendUser: user, isLoading } = useAuthUser();

  const { clearSession } = useAuth0();
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

  const navigateToSecurity = () => {
    console.log("To Security Button Pushed");
  };

  const navigateToNotifications = () => {
    console.log("To Notifications Button Pushed");
  };

  const navigateToTeamMembers = () => {
    console.log("To Team Members Button Pushed");
  };

  const navigateToSettings = () => {
    console.log("Settings Button Pushed");
  };

  const navigateToHelp = () => {
    console.log("Help Button Pushed");
  };

  const navigateToPreferences = () => {
    console.log("Preferences Button Pushed");
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
                onEditProfile={navigateToEditProfile}
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
              iconName="lock.fill"
              title="Privacy & Security"
              onPress={navigateToSecurity}
            />

            <ProfileMenuItem
              iconName="bell.fill"
              title="Notifications"
              onPress={navigateToNotifications}
            />

            {/* Team Management Section */}
            <ThemedText type="defaultSemiBold" className="px-5 pt-2">
              TEAM MANAGEMENT
            </ThemedText>

            <ProfileMenuItem
              iconName="person.2.fill"
              title="Team Members"
              onPress={navigateToTeamMembers}
            />

            {/* Preferences Section */}
            <ThemedText type="defaultSemiBold" className="px-5 pt-2">
              PREFERENCES
            </ThemedText>
            <ProfileMenuItem
              iconName="moonphase.new.moon.inverse"
              title="Appearance"
              onPress={navigateToPreferences}
            />

            <ProfileMenuItem
              iconName="app.badge"
              title="App Settings"
              onPress={navigateToSettings}
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
