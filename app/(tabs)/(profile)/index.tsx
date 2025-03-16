import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { UserMetadata } from "@/components/profile/data/profile";
import ProfileMetrics from "@/components/profile/details/ProfileMetrics";
import ProfileHeader from "@/components/profile/details/ProfileHeader";
import ProfileMenuItem from "@/components/profile/details/ProfileMenuItem";
import { IconSymbol } from "@/components/ui/IconSymbol";

const ProfileScreen = () => {
  const { user, clearSession } = useAuth0();

  // Only proceed if we have a valid user
  const metadata = (user?.user_metadata as UserMetadata) || {};
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
    console.log("Settings Button Pushed");
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

  const navigateToLogin = () => {
    router.replace("/");
  };

  // Error screen when no user is found
  if (!user) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
      >
        <View className="flex-1 justify-center items-center p-8">
          <IconSymbol name="exclamationmark.circle" size={64} color="#ff3b30" />
          <ThemedText type="title" className="text-center mt-6 mb-4">
            Authentication Error
          </ThemedText>
          <ThemedText className="text-center mb-8">
            Your session may have expired or you're not logged in. Please sign
            in to view your profile.
          </ThemedText>
          <Button className="w-full rounded-2xl mb-4" onPress={navigateToLogin}>
            <ButtonText className="text-white">Go to Login</ButtonText>
          </Button>
        </View>
      </ParallaxScrollView>
    );
  }

  // Regular profile screen when user is available
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 40 }}
        bounces={true}
      >
        <Box className="relative bg-primary-50">
          {/* Profile Header */}
          <ProfileHeader
            name={user.name || ""}
            picture={user.picture}
            onEditProfile={navigateToEditProfile}
          />

          {/* Profile Stats */}
          <ProfileMetrics
            propertiesCount={propertiesCount}
            teamMembersCount={teamMembersCount}
            activeTasksCount={activeTasksCount}
          />

          {/* Account Settings Section */}
          <ThemedText type="defaultSemiBold" className="px-4 pt-2">
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
          <ThemedText type="defaultSemiBold" className="px-4 pt-2">
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
          <ThemedText type="defaultSemiBold" className="px-4 pt-2">
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
          <ThemedText type="defaultSemiBold" className="px-4 pt-2">
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
    </ParallaxScrollView>
  );
};

export default ProfileScreen;
