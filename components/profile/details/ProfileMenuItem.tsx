import React from "react";
import { TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Box } from "@/components/ui/box";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { IconSymbolName } from "@/components/ui/IconSymbol";

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
    <Box className="mr-2 ml-2 p-4 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
      <TouchableOpacity onPress={onPress}>
        <Box className="w-10">
          <IconSymbol name={iconName} size={24} color="gray" />
        </Box>
        <ThemedText className="flex-1">{title}</ThemedText>
      </TouchableOpacity>
    </Box>
  );
};

export default ProfileMenuItem;
