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
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Box } from "@/components/ui/box";

interface ProfileHeaderProps {
  name: string;
  picture?: string;
  role: string;
  onEditProfile: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  picture,
  role,
  onEditProfile,
}) => {
  return (
    <Box className="p-2 mr-2 ml-2 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
      <HStack className="items-center bg-white">
        <Avatar size="lg" className="mr-4">
          {picture ? (
            <AvatarImage source={{ uri: picture }} />
          ) : (
            <AvatarFallbackText>
              {name ? name.charAt(0) : "?"}
            </AvatarFallbackText>
          )}
          <TouchableOpacity
            className="absolute bottom-0 right-0 bg-primary-500 rounded-full w-6 h-6 items-center justify-center"
            onPress={onEditProfile}
          >
            <IconSymbol name="plus" size={14} color="white" />
          </TouchableOpacity>
        </Avatar>
        <VStack>
          <ThemedText type="defaultSemiBold">{name}</ThemedText>
          <ThemedText>{role}</ThemedText>
          <TouchableOpacity onPress={onEditProfile}>
            <ThemedText type="link">Edit Profile</ThemedText>
          </TouchableOpacity>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ProfileHeader;
