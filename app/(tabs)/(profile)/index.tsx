import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { router } from "expo-router";
import React from "react";
import { useAuth0 } from "react-native-auth0";
import {
  ProfileData,
  UserMetadata,
  currentUserProfile,
} from "@/components/profile/data/profile";
import ProfileMetrics from "@/components/profile/details/ProfileMetrics";
import ProfileHeader from "@/components/profile/details/ProfileHeader";
import ProfileMenuItem from "@/components/profile/details/ProfileMenuItem";

const ProfileScreen: React.FC<ProfileData> = () => {
  const { user, clearSession } = useAuth0();

  // Use the mock data when no Auth0 user data is available
  const profileData = user || currentUserProfile;
  const metadata = (profileData?.user_metadata as UserMetadata) || {};
  const role = metadata.role || "Property Manager";
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
    //replace later account info page
    console.log("ToAccountInfo Button Pushed");
  };

  const navigateToSecurity = () => {
    //replace later privacy & security page
    console.log("To Security Button Pushed");
  };

  const navigateToNotifications = () => {
    //replace later
    console.log("To Notifications Button Pushed");
  };

  const navigateToTeamMembers = () => {
    //replace later
    console.log("To Team Members Button Pushed");
  };

  const navigateToRoles = () => {
    //replace later
    console.log("To Roles & permissions Button Pushed");
  };

  const navigateToEditProfile = () => {
    //replace later
    console.log("To Edit Profile Button Pushed");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <Box className="flex-1 relative bg-primary-50">
        {/* Profile Header */}
        <ProfileHeader
          name={user?.name || "John Doe"}
          picture={user?.picture}
          role={role}
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

        {/* Logout Button */}
        <Button className="rounded-2xl mr-2 ml-2 mt-2" onPress={handleLogout}>
          <ButtonText className=" text-white">Logout</ButtonText>
        </Button>
      </Box>
    </ParallaxScrollView>
  );
};

export default ProfileScreen;
