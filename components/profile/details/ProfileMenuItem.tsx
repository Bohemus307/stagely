import React from "react";
import { TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { IconSymbolName } from "@/components/ui/IconSymbol";
import { HStack } from "@/components/ui/hstack";

interface ProfileMenuItemProps {
  iconName: IconSymbolName;
  title: string;
  onPress: () => void;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
  iconName,
  title,
  onPress,
}) => {
  return (
    <Box className="mr-4 ml-4 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
      <TouchableOpacity onPress={onPress}>
        <HStack className="items-center">
          <Box className="w-10">
            <IconSymbol name={iconName} size={24} color="gray" />
          </Box>
          <ThemedText className="flex-1">{title}</ThemedText>
        </HStack>
      </TouchableOpacity>
    </Box>
  );
};

export default ProfileMenuItem;
