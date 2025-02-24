import  { TouchableOpacity, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth0 } from "react-native-auth0";
import { useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";
import { ThemedView } from '@/components/ThemedView';
import {
    Avatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
  } from "@/components/ui/avatar"
import { Button, ButtonText } from "./ui/button";


function Header() {
    const { user } = useAuth0();
    const router = useRouter();

    return (
      <ThemedView
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 6,
          paddingVertical: 40,
          paddingBottom: 5,
          backgroundColor: "#ffffff",
          marginTop: 15,
        }}
      >
        <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("@/assets/images/adaptive-icon.png")}
            style={{ width: 32, height: 32, marginLeft: 0, marginRight: 5 }}
          />
          <ThemedText type="default">Stagely</ThemedText>
        </ThemedView>

        {/* Notifications Button */}
        <TouchableOpacity
          style={{ marginLeft: 210 }}
          onPress={() => console.log("Notifications pressed")}
        >
          <MaterialIcons name="notifications" size={24} color="#687076" />
        </TouchableOpacity>

        {/*Avatar Button */}
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
          <Button className="w-20" size="md" variant="solid" action="primary">
            <ButtonText>Hello World!</ButtonText>
          </Button>
        </TouchableOpacity>
      </ThemedView>
    );
}

export default Header;
