import  {View, TouchableOpacity, Image } from "react-native";
import { Bell } from "lucide-react-native";
import { useAuth0 } from "react-native-auth0";
import { useRouter } from "expo-router";
import { ThemedText } from "./ThemedText";
import {
    Avatar,
    AvatarBadge,
    AvatarFallbackText,
    AvatarImage,
  } from "../components/ui/avatar"
export function Header() {
    const { user } = useAuth0();
    const router = useRouter();

    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 6,
                paddingVertical: 20,
                paddingBottom: 5,
                backgroundColor: "#ffffff"
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center"}}>
                <Image
                    source={require("@/assets/images/adaptive-icon.png")}
                    style={{ width: 32, height: 32, marginLeft: 0 }}
                />
                <ThemedText type="default">Stagely</ThemedText>
            </View>

            {/* Notifications Button */}
            <TouchableOpacity style={{marginRight: 0, marginLeft: 195 }} onPress={() => console.log("Notifications pressed")}>
                <Bell color="#687076" size={24} />
            </TouchableOpacity>

            {/*Avatar Button */}
            <TouchableOpacity onPress={() => router.push("/explore")}> //NeedTo Fix
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
        </View>
    );
}
