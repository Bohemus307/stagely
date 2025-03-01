import ParallaxScrollView from '@/components/ParallaxScrollView';
import  MetricsCard  from '@/components/MetricsCard';
import RecentActivity from '@/components/RecentActivity';
import QuickActions from '@/components/QuickActions';

export default function HomeScreen() {

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}>
      <MetricsCard />
      <RecentActivity />
      <QuickActions />
    </ParallaxScrollView>
  );
}
