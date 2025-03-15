import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import Header from "@/components/Header";

type Props = PropsWithChildren<{
  headerImage?: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({ children }: Props) {
  const bottom = useBottomTabOverflow();

  return (
    <ThemedView style={styles.container}>
      {/* Header is now in a regular view, not a ScrollView */}
      <Animated.View>
        <Header />
      </Animated.View>

      {/* Children (which contain their own scrolling) are rendered directly */}
      <ThemedView style={[styles.content, { paddingBottom: bottom }]}>
        {children}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 5,
    gap: 16,
    overflow: "hidden",
  },
});
