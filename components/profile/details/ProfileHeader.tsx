import React from "react";
import { TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";

interface ProfileHeaderProps {
  name: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  firstName,
  lastName,
  picture,
  onEditProfile,
}) => {
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`.trim()
      : firstName || lastName
        ? firstName || lastName
        : name;

  return (
    <Box className="mr-4 ml-4 p-4 rounded-lg shadow-lg overflow-hidden bg-white">
      <HStack className="p-4 items-center ">
        <Avatar size="lg" className="mr-4">
          {picture ? (
            <AvatarImage source={{ uri: picture }} />
          ) : (
            <AvatarFallbackText>
              {displayName ? displayName.charAt(0) : "?"}
            </AvatarFallbackText>
          )}
        </Avatar>
        <VStack>
          <ThemedText type="defaultSemiBold">{displayName}</ThemedText>
          <TouchableOpacity onPress={onEditProfile}>
            <ThemedText type="link">Edit Profile</ThemedText>
          </TouchableOpacity>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ProfileHeader;
