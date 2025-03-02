import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { ThemedText } from "./ThemedText";

const BackButton = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    // Check if there's a screen to go back to
    const canGoBack = navigation.canGoBack();

    if (canGoBack) {
      // If we can go back, use router.back()
      router.back();
    } else {
      // If we can't go back, navigate to your fallback screen
      // You can replace 'index' with any route you want as a fallback
      router.replace("/");
    }
  };

  return (
    <TouchableOpacity onPress={handleBack} className="flex flex-row px-1 py-3">
      <Ionicons
        name="chevron-back"
        size={24}
        color={Colors.light.tabIconDefault}
      />
      <ThemedText className="font-medium">Back</ThemedText>
    </TouchableOpacity>
  );
};

export default BackButton;
