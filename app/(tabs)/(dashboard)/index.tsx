import MetricsCard from "@/components/dashboard/MetricsCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickActions from "@/components/dashboard/QuickActions";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";

export default function HomeScreen() {
  return (
    <ResponsiveScreenWrapper>
      <MetricsCard />
      <RecentActivity />
      <QuickActions />
    </ResponsiveScreenWrapper>
  );
}
