import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { Colors } from "@/constants/Colors";
import Header from "@/components/Header";
import { useColorScheme } from "@/hooks/useColorScheme";

// Define mobile-oriented breakpoints (better for React Native)
export const BREAKPOINTS = {
  smallPhone: 320, // Small phones (iPhone SE etc.)
  phone: 414, // Regular phones (iPhone 12/13/14)
  largePhone: 480, // Large phones (iPhone Plus models, etc.)
  tablet: 768, // iPads and tablets
  largeTablet: 1024, // Large tablets (iPad Pro etc.)
};

// Create a context to expose screen size information
interface ResponsiveContextType {
  screenWidth: number;
  screenHeight: number;
  isSmallPhone: boolean;
  isRegularPhone: boolean;
  isLargePhone: boolean;
  isTablet: boolean;
  isLargeTablet: boolean;
  screenSize: "smallPhone" | "phone" | "largePhone" | "tablet" | "largeTablet";
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  screenWidth: 0,
  screenHeight: 0,
  isSmallPhone: false,
  isRegularPhone: false,
  isLargePhone: false,
  isTablet: false,
  isLargeTablet: false,
  screenSize: "phone",
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

  /** Whether this screen has a tab bar */
  hasTabBar?: boolean;

  /** Custom bottom padding (if you want to override the default) */
  bottomPadding?: number;
}

/**
 * ResponsiveScreenWrapper - A responsive screen wrapper that provides consistent
 * layout across different mobile device sizes and exposes screen size information via context
 */
const ResponsiveScreenWrapper: React.FC<ResponsiveScreenWrapperProps> = ({
  children,
  scrollable = true,
  withKeyboardAvoid = true,
  safeAreaProps = {},
  containerProps = {},
  scrollViewProps = {},
  edges = ["top", "left", "right"],
  hasTabBar = true,
  bottomPadding,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));

  // Update dimensions on change (orientation changes, foldable devices, etc.)
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription.remove();
  }, []);

  const { width, height } = dimensions;

  // Determine device category based on width
  const isSmallPhone = width <= BREAKPOINTS.smallPhone;
  const isRegularPhone =
    width > BREAKPOINTS.smallPhone && width <= BREAKPOINTS.phone;
  const isLargePhone =
    width > BREAKPOINTS.phone && width <= BREAKPOINTS.largePhone;
  const isTablet =
    width > BREAKPOINTS.largePhone && width <= BREAKPOINTS.tablet;
  const isLargeTablet = width > BREAKPOINTS.tablet;

  // Determine screen size category
  const screenSize = isLargeTablet
    ? "largeTablet"
    : isTablet
      ? "tablet"
      : isLargePhone
        ? "largePhone"
        : isRegularPhone
          ? "phone"
          : "smallPhone";

  // Create responsive context value
  const responsiveValue: ResponsiveContextType = {
    screenWidth: width,
    screenHeight: height,
    isSmallPhone,
    isRegularPhone,
    isLargePhone,
    isTablet,
    isLargeTablet,
    screenSize,
  };

  const containerStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.background,
      paddingHorizontal: isTablet || isLargeTablet ? 16 : 0,
    },
  });

  // Get safe area insets for handling notches and home indicators
  const insets = useSafeAreaInsets();

  // Calculate tab bar height (typically 49pt for iOS plus bottom safe area)
  const tabBarHeight = Platform.OS === "ios" ? 49 + insets.bottom : 56;

  // Determine bottom padding
  const calculatedBottomPadding =
    bottomPadding !== undefined
      ? bottomPadding
      : hasTabBar
        ? tabBarHeight + 20 // Add extra padding if there's a tab bar
        : 20; // Standard padding if no tab bar

  // Content container for ScrollView with proper padding for tab bar
  const contentContainerStyle = scrollable
    ? {
        flexGrow: 1,
        paddingBottom: calculatedBottomPadding,
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
        <View
          style={{
            flex: 1,
            paddingBottom: hasTabBar ? calculatedBottomPadding : 0,
          }}
        >
          {children}
        </View>
      )}
    </Box>
  );

  return (
    <ResponsiveContext.Provider value={responsiveValue}>
      <SafeAreaView
        //className="bg-white"
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
