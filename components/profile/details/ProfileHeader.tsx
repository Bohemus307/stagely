import React, { useMemo } from "react";
import { ThemedText } from "@/components/ThemedText";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { User } from "@/lib/@types/properties";

interface ProfileHeaderProps {
  user: User;
  fallbackPicture?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  fallbackPicture,
}) => {
  const profileImageUrl = useMemo(() => {
    const getCloudFrontUrl = (s3Url: string): string | null => {
      if (!s3Url) return null;
      const s3Key = s3Url.split("amazonaws.com/")[1];
      if (!s3Key) return s3Url;
      return `https://d24y6hzot6c372.cloudfront.net/${s3Key}`;
    };

    if (user?.profilePictureUrl) {
      try {
        const decodedUrl = decodeURI(user.profilePictureUrl);
        return getCloudFrontUrl(decodedUrl);
      } catch (error) {
        console.warn("Error decoding profile picture URL:", error);
        return null;
      }
    }
    return null;
  }, [user?.profilePictureUrl]);

  const imageSource = profileImageUrl || fallbackPicture;

  return (
    <Box className="mr-4 ml-4 p-4 rounded-lg shadow-lg overflow-hidden bg-white">
      <HStack className="p-4 items-center">
        <Avatar size="lg" className="mr-4">
          {imageSource ? (
            <AvatarImage source={{ uri: imageSource }} />
          ) : (
            <AvatarFallbackText>
              {user?.firstName ? user.firstName.charAt(0) : ""}
              {user?.lastName ? user.lastName.charAt(0) : ""}
            </AvatarFallbackText>
          )}
        </Avatar>

        <VStack>
          <ThemedText type="defaultSemiBold">
            {user?.firstName} {user?.lastName}
          </ThemedText>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ProfileHeader;
