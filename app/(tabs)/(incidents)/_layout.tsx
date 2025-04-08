import { Stack } from "expo-router";

export default function IncidentsLayout() {
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
          presentation: "modal",
        }}
      />

      {/* Add explicit configuration for new.tsx */}
      <Stack.Screen
        name="new"
        options={{
          headerShown: false,
          presentation: "card", // This forces standard screen presentation
        }}
      />

      <Stack.Screen
        name="[addIncident]"
        options={{
          headerShown: false,
          presentation: "modal", // Change from modal to card
        }}
      />
    </Stack>
  );
}
