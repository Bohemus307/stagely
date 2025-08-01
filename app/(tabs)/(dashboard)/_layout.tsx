import { Stack } from "expo-router";

export default function AddPropertyLayout() {
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
      <Stack.Screen
        name="addIncident"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="addProperty"
        options={{
          headerShown: false,
          presentation: "modal",
          animationTypeForReplace: "push",
        }}
      />
    </Stack>
  );
}
