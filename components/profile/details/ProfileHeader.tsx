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
  picture?: string;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  picture,
  onEditProfile,
}) => {
  return (
    <Box className="mr-4 ml-4 p-4 mt-4 rounded-lg shadow-lg overflow-hidden bg-white">
      <HStack className="p-4 justify-between items-center">
        <Avatar size="md" className="mr-4">
          {picture ? (
            <AvatarImage source={{ uri: picture }} />
          ) : (
            <AvatarFallbackText>
              {name ? name.charAt(0) : "?"}
            </AvatarFallbackText>
          )}
        </Avatar>
        <VStack>
          <ThemedText type="defaultSemiBold">{name}</ThemedText>
          <TouchableOpacity onPress={onEditProfile}>
            <ThemedText type="link">Edit Profile</ThemedText>
          </TouchableOpacity>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ProfileHeader;
