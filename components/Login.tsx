import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useAuth0 } from "react-native-auth0";
import { Button, ButtonText } from "./ui/button";
import { Spinner } from "./ui/spinner";
import Constants from "expo-constants";

export default function Login() {
  const { authorize, error, isLoading } = useAuth0();
  const apiAudience =
    Constants.expoConfig?.extra?.stagelyAudience ||
    process.env.STAGELY_AUDIENCE;

  const onLogin = async () => {
    try {
      await authorize({
        audience: apiAudience,
        scope: "read:users read:data",
      });
    } catch (e) {
      console.log(e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner size={"large"} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../assets/images/splash-icon.png")}
        contentFit="contain"
        transition={1000}
      />
      <Button onPress={onLogin}>
        <ButtonText>Log In</ButtonText>
      </Button>

      {error && <Text>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingBottom: 55,
  },
  image: {
    flex: 1,
    width: "75%",
  },
});
