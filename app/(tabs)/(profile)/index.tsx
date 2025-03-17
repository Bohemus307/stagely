import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { UserMetadata } from "@/components/profile/data/profile";
import ProfileMetrics from "@/components/profile/details/ProfileMetrics";
import ProfileHeader from "@/components/profile/details/ProfileHeader";
import ProfileMenuItem from "@/components/profile/details/ProfileMenuItem";
import { Spinner } from "@/components/ui/spinner";
import Header from "@/components/Header";
import { ThemedView } from "@/components/ThemedView";

const ProfileScreen = () => {
  const { user, clearSession, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  // If no user after loading completes, redirect to login
  if (!user) {
    router.replace("/");
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  const userData = user!;
  const metadata = (userData.user_metadata as UserMetadata) || {};
  const propertiesCount = metadata.properties || 0;
  const teamMembersCount = metadata.teamMembers || 0;
  const activeTasksCount = metadata.activeTasks || 0;

  const handleLogout = async () => {
    try {
      await clearSession();
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const navigateToAccountInfo = () => {
    console.log("ToAccountInfo Button Pushed");
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

  const navigateToRoles = () => {
    console.log("To Roles & permissions Button Pushed");
  };

  const navigateToEditProfile = () => {
    router.push("/(tabs)/(profile)/edit");
  };

  return (
    <ThemedView className="flex-1">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 40 }}
        bounces={true}
      >
        <Box className="relative">
          {/* Profile Header */}
          <ProfileHeader
            name={userData.name || ""}
            picture={userData.picture}
            onEditProfile={navigateToEditProfile}
          />

          {/* Profile Stats */}
          <ProfileMetrics
            propertiesCount={propertiesCount}
            teamMembersCount={teamMembersCount}
            activeTasksCount={activeTasksCount}
          />

          {/* Account Settings Section */}
          <ThemedText type="defaultSemiBold" className="px-5 pt-2">
            ACCOUNT SETTINGS
          </ThemedText>

          <ProfileMenuItem
            iconName="person.circle.fill"
            title="Account Information"
            onPress={navigateToAccountInfo}
          />
          <Divider />

          <ProfileMenuItem
            iconName="lock.fill"
            title="Privacy & Security"
            onPress={navigateToSecurity}
          />
          <Divider />

          <ProfileMenuItem
            iconName="bell.fill"
            title="Notifications"
            onPress={navigateToNotifications}
          />
          <Divider />

          {/* Team Management Section */}
          <ThemedText type="defaultSemiBold" className="px-5 pt-2">
            TEAM MANAGEMENT
          </ThemedText>

          <ProfileMenuItem
            iconName="person.2.fill"
            title="Team Members"
            onPress={navigateToTeamMembers}
          />
          <Divider />

          <ProfileMenuItem
            iconName="person.2.fill"
            title="Roles & Permissions"
            onPress={navigateToRoles}
          />
          <Divider />

          {/* Preferences Section */}
          <ThemedText type="defaultSemiBold" className="px-5 pt-2">
            PREFERENCES
          </ThemedText>
          <ProfileMenuItem
            iconName="moonphase.new.moon.inverse"
            title="Appearance"
            onPress={navigateToPreferences}
          />
          <Divider />

          <ProfileMenuItem
            iconName="app.badge"
            title="App Settings"
            onPress={navigateToSettings}
          />
          <Divider />

          {/* Support Section */}
          <ThemedText type="defaultSemiBold" className="px-5 pt-2">
            SUPPORT
          </ThemedText>
          <ProfileMenuItem
            iconName="circle.badge.questionmark"
            title="Help Center"
            onPress={navigateToHelp}
          />
          <Divider />

          <ProfileMenuItem
            iconName="square.and.arrow.up.on.square"
            title="Log Out"
            onPress={handleLogout}
          />
          <Divider />
        </Box>
      </ScrollView>
    </ThemedView>
  );
};

export default ProfileScreen;
