import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useAuth0 } from 'react-native-auth0';
import { Button, ButtonText } from '@/components/ui/button';
import  MetricsCard  from '@/components/MetricsCard';
import RecentActivity from '@/components/RecentActivity';
import QuickActions from '@/components/QuickActions';

export default function HomeScreen() {
  const { clearSession } = useAuth0();

  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.log("Log out cancelled", e);
    }
  };

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: "#042C44", dark: "#1D3D47" }}>
      <Button onPress={onLogout} className="mt-4">
        <ButtonText>Log Out</ButtonText>
      </Button>
      <MetricsCard />
      <RecentActivity />
      <QuickActions />
    </ParallaxScrollView>
  );
}
