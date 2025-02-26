import  { TouchableOpacity, Image, StyleSheet } from "react-native";
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

function Header() {
    const { user } = useAuth0();
    const router = useRouter();

    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.logoContainer}>
          <TouchableOpacity onPress={() => console.log("Image Pressed!")} activeOpacity={0.7}>
          <Image
            source={require("@/assets/images/adaptive-icon.png")}
            style={styles.logo}
          />
          </TouchableOpacity>
          <ThemedText type="default">Stagely</ThemedText>
        </ThemedView>

        {/* Notifications Button */}
        <TouchableOpacity style={styles.notificationsButton} onPress={() => console.log("Notifications pressed")}>
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
        </TouchableOpacity>
      </ThemedView>
    );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 40,
    paddingBottom: 5,
    backgroundColor: "#ffffff",
    marginTop: 15,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    marginLeft: 0,
    marginRight: 5,
  },
  notificationsButton: {
    marginLeft: 210,
  },
});

export default Header;
