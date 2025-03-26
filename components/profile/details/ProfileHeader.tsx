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
import { User } from "@/lib/@types/properties";

interface ProfileHeaderProps {
  user?: User | null;
  onEditProfile: () => void;
  fallbackPicture?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onEditProfile,
  fallbackPicture,
}) => {
  return (
    <Box className="mr-4 ml-4 p-4 rounded-lg shadow-lg overflow-hidden bg-white">
      <HStack className="p-4 items-center">
        <Avatar size="lg" className="mr-4">
          {user?.profilePictureUrl || fallbackPicture ? (
            <AvatarImage
              source={{
                uri: user?.profilePictureUrl || fallbackPicture,
              }}
            />
          ) : (
            <AvatarFallbackText>
              {user?.firstName ? user.firstName.charAt(0) : ""}
              {user?.lastName ? user.lastName.charAt(0) : ""}
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
          <ThemedText type="defaultSemiBold">
            {user?.firstName} {user?.lastName}
          </ThemedText>
          <TouchableOpacity onPress={onEditProfile}>
            <ThemedText type="link">Edit Profile</ThemedText>
          </TouchableOpacity>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ProfileHeader;
