import ParallaxScrollView from "@/components/ParallaxScrollView";
import MetricsCard from "@/components/dashboard/MetricsCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView } from "react-native";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}
    >
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 40 }}
        bounces={true}
      >
        <ThemedView>
          <MetricsCard />
          <RecentActivity />
          <QuickActions />
        </ThemedView>
      </ScrollView>
    </ParallaxScrollView>
  );
}
