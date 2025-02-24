import { StyleSheet, Text } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth0 } from 'react-native-auth0';
import { Button, ButtonText } from '@/components/ui/button';
import { Link } from 'expo-router';


export default function HomeScreen() {
  const { user, clearSession } = useAuth0();
  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.log("Log out cancelled", e);
    }
  };

  return (
    <ParallaxScrollView
    headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <Text>{user?.email}</Text>
        <HelloWave />
        <Button onPress={onLogout}>
          <ButtonText>Log Out</ButtonText>
        </Button>

        <Link href="./addProperty" asChild>
          <Button>
            <ButtonText>Add Property</ButtonText>
          </Button>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
