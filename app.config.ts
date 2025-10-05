// app.config.ts
export default {
  expo: {
    name: "stagely",
    slug: "stagely",
    version: "1.0.1",
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
      // Add this section for camera permissions
      infoPlist: {
        NSCameraUsageDescription:
          "This app uses the camera to document property incidents and take before/after photos for inspections.",
        NSPhotoLibraryUsageDescription:
          "This app needs access to your photo library to save and manage property photos.",
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
      // Add this section for camera permissions
      infoPlist: {
        NSCameraUsageDescription:
          "This app uses the camera to document property incidents and take before/after photos for inspections.",
        NSPhotoLibraryUsageDescription:
          "This app needs access to your photo library to save and manage property photos.",
      },
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
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
          savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
          isAccessMediaLocationEnabled: true,
        },
      ],
    ],
    extra: {
      domain: process.env.EXPO_PUBLIC_DOMAIN,
      clientId: process.env.EXPO_PUBLIC_CLIENT_ID,
      googleMapsKey: process.env.GOOGLE_MAPS_API_KEY,
      stagelyApiUrl: process.env.STAGELY_API_URL,
      stagelyAudience: process.env.STAGELY_AUDIENCE,
      eas: {
        projectId: "c2961139-ef6a-464b-8b6a-a590752c0b49",
      },
    },
    experiments: {
      typedRoutes: true,
    },
  },
};
