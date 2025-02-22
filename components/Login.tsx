import { View, Button, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useAuth0 } from "react-native-auth0";

export default function Login() {
  const { authorize, error, isLoading } = useAuth0();

  const onLogin = async () => {
    try {
      await authorize();
    } catch (e) {
      console.log(e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
  
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../assets/images/splash-icon.png")}
        placeholder={{ blurhash }}
        contentFit="contain"
        transition={1000}
      />
      <Button onPress={onLogin} title={"Log In"} />
      
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
  },
  image: {
    flex: 1,
    width: "75%",
  },
});
