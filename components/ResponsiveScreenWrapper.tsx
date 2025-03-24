import React, { ReactNode, createContext, useContext } from "react";
import {
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { useMediaQuery } from "@/components/ui/utils/use-media-query";

import { useColorScheme } from "@/hooks/useColorScheme";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";

// Define breakpoints
export const BREAKPOINTS = {
  sm: 480, // Phone
  md: 768, // Tablet
  lg: 992, // Desktop
  xl: 1280, // Large desktop
};

// Create a context to expose screen size information
interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: "small" | "medium" | "large";
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  isMobile: true,
  isTablet: false,
  isDesktop: false,
  screenSize: "small",
});

// Hook to use responsive context
export const useResponsive = () => useContext(ResponsiveContext);

interface ResponsiveScreenWrapperProps {
  /** The screen content */
  children: ReactNode;

  /** Whether the screen should be scrollable */
  scrollable?: boolean;

  /** Whether to add keyboard avoiding behavior */
  withKeyboardAvoid?: boolean;

  /** Props to pass to the SafeAreaView */
  safeAreaProps?: React.ComponentProps<typeof SafeAreaView>;

  /** Props to pass to the main container Box */
  containerProps?: React.ComponentProps<typeof Box>;

  /** Props to pass to the ScrollView if scrollable */
  scrollViewProps?: React.ComponentProps<typeof ScrollView>;

  /** SafeAreaView edges */
  edges?: Edge[];
}

/**
 * ResponsiveScreenWrapper - A responsive screen wrapper that provides consistent
 * layout across different device sizes and exposes screen size information via context
 */
const ResponsiveScreenWrapper: React.FC<ResponsiveScreenWrapperProps> = ({
  children,
  scrollable = true,
  withKeyboardAvoid = true,
  safeAreaProps = {},
  containerProps = {},
  scrollViewProps = {},
  edges = ["top", "left", "right"],
}) => {
  const colorScheme = useColorScheme() ?? "light";

  // Use media queries to determine screen size
  const [isMobile] = useMediaQuery([{ maxWidth: BREAKPOINTS.sm }]);
  const [isTablet] = useMediaQuery([
    { minWidth: BREAKPOINTS.sm + 1 },
    { maxWidth: BREAKPOINTS.md },
  ]);
  const [isDesktop] = useMediaQuery([{ minWidth: BREAKPOINTS.md + 1 }]);

  // Determine screen size category
  const screenSize: "small" | "medium" | "large" = isDesktop
    ? "large"
    : isTablet
      ? "medium"
      : "small";

  // Create responsive context value
  const responsiveValue: ResponsiveContextType = {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
  };

  const containerStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.background,
    },
  });

  // Content container for ScrollView
  const contentContainerStyle = scrollable
    ? {
        flexGrow: 1,
      }
    : undefined;

  // Main content component
  const Content = () => (
    <Box style={containerStyle.container} {...containerProps}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </Box>
  );

  return (
    <ResponsiveContext.Provider value={responsiveValue}>
      <SafeAreaView
        className="bg-white"
        style={{ flex: 1 }}
        edges={edges}
        {...safeAreaProps}
      >
        <Header />
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent
        />

        {withKeyboardAvoid ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <Content />
          </KeyboardAvoidingView>
        ) : (
          <Content />
        )}
      </SafeAreaView>
    </ResponsiveContext.Provider>
  );
};

export default ResponsiveScreenWrapper;
