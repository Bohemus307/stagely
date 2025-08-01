import { Stack } from "expo-router";

export default function PhotosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}
