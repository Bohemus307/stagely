import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Auth0Provider } from "react-native-auth0";
import Constants from 'expo-constants';
import "react-native-get-random-values";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Get values from Constants
const DOMAIN = Constants.expoConfig?.extra?.domain;
const CLIENT_ID = Constants.expoConfig?.extra?.clientId;

export default function RootLayout() {
  const [loaded] = useFonts({
    Montserrat: require("../assets/fonts/Montserrat-VariableFont_wght.ttf"),
    CrimsonText: require("../assets/fonts/CrimsonText-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Auth0Provider domain={DOMAIN} clientId={CLIENT_ID}>
      <GluestackUIProvider mode="light">
        <Stack screenOptions={{
        headerShown: false
      }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </GluestackUIProvider>
    </Auth0Provider>
  );
}
