// app.config.ts
export default {
  expo: {
    name: "stagely",
    slug: "stagely",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.joshua307.stagely",
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.joshua307.stagely",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "react-native-auth0",
        {
          domain: "dev-fxqphucoelzcm6nf.us.auth0.com",
        },
      ],
    ],
    extra: {
      domain: process.env.EXPO_PUBLIC_DOMAIN,
      clientId: process.env.EXPO_PUBLIC_CLIENT_ID,
      googleMapsKey: process.env.GOOGLE_MAPS_API_KEY,
    },
    experiments: {
      typedRoutes: true,
    },
  },
};
