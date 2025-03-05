import { TouchableOpacity, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth0 } from "react-native-auth0";
import { useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";

function Header() {
  const { user } = useAuth0();
  const router = useRouter();

  return (
    <ThemedView className="flex-row justify-between items-center px-2 py-10 pb-1 bg-white mt-4">
      <ThemedView className="flex-row items-center">
        <TouchableOpacity
          onPress={() => console.log("Image Pressed!")}
          activeOpacity={0.7}
        >
          <Image
            source={require("@/assets/images/adaptive-icon.png")}
            className="w-8 h-8 mr-2"
          />
        </TouchableOpacity>
        <ThemedText type="default">Stagely</ThemedText>
      </ThemedView>

      <TouchableOpacity
        className="ml-52"
        onPress={() => console.log("Notifications pressed")}
      >
        <MaterialIcons name="notifications" size={24} color="#687076" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
        <Avatar size="sm">
          {user?.picture ? (
            <AvatarImage source={{ uri: user.picture }} />
          ) : (
            <AvatarFallbackText>
              {user?.name ? user.name.charAt(0) : "?"}
            </AvatarFallbackText>
          )}
          <AvatarBadge />
        </Avatar>
      </TouchableOpacity>
    </ThemedView>
  );
}

export default Header;
