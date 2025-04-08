import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import IncidentCard from "@/components/incidents/list/IncidentCard";
import { getTimeAgo } from "@/components/incidents/lib/utils/incidentHelpers";
import { Text, View, TouchableOpacity, Image as RNImage } from "react-native";
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from "@/lib/@types/properties";

// Mock the helper functions
jest.mock("@/components/incidents/lib/utils/incidentHelpers", () => ({
  getIncidentStatusBadge: jest.fn(() => "bg-red-400/80 text-white rounded-2xl"),
  getTimeAgo: jest.fn(() => "2 hours ago"),
}));

// Mock Constants to avoid issues with GOOGLE_MAPS_API_KEY
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      googleMapsKey: "mock-api-key",
    },
  },
}));

// Mock UI components
jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: { children: React.ReactNode }) => (
    <View testID="hstack">{children}</View>
  ),
}));

jest.mock("@/components/ui/vstack", () => ({
  VStack: ({ children }: { children: React.ReactNode }) => (
    <View testID="vstack">{children}</View>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <View testID="badge" className={className}>
      {children}
    </View>
  ),
}));

jest.mock("@/components/ui/pressable", () => ({
  Pressable: ({
    children,
    onPress,
  }: {
    children: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity testID="pressable" onPress={onPress}>
      {children}
    </TouchableOpacity>
  ),
}));

jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: ({
    name,
    size,
    color,
  }: {
    name: string;
    size: number;
    color: string;
  }) => (
    <View
      testID="icon-symbol"
      data-name={name}
      data-size={size}
      data-color={color}
    />
  ),
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <View testID="box" className={className}>
      {children}
    </View>
  ),
}));

jest.mock("@/components/ui/heading", () => ({
  Heading: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <Text testID="heading" className={className}>
      {children}
    </Text>
  ),
}));

jest.mock("@/components/ui/image", () => ({
  Image: ({
    source,
    alt,
    className,
    onError,
  }: {
    source: any;
    alt: string;
    className?: string;
    onError?: () => void;
  }) => {
    // Optional error simulation
    if (onError && Math.random() < 0.5) {
      onError();
    }
    return <RNImage testID="image" source={source} accessibilityLabel={alt} />;
  },
}));

describe("IncidentCard", () => {
  // Create a helper function for type-safe incident creation
  const createTestIncident = (overrides = {}): Incident => {
    const baseIncident: Incident = {
      id: 101,
      propertyId: 123,
      incidentType: "Water Damage",
      description: "Leak in kitchen ceiling",
      reportedAt: "2025-02-15T10:30:00Z",
      severity: "High" as IncidentSeverity,
      status: "Open" as IncidentStatus,
      images: [],
      createdAt: "",
      updatedAt: "",
      ...overrides,
    };

    return baseIncident;
  };

  // Sample incident for testing
  const mockIncident = createTestIncident();

  // Mock event handlers
  const mockOnPress = jest.fn();
  const mockOnDetailsPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders incident card with correct details", () => {
    const { getByText } = render(
      <IncidentCard
        incident={mockIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Check if main incident information is displayed
    expect(getByText("Water Damage")).toBeTruthy();
    expect(getByText(/Property #123/)).toBeTruthy();
    expect(getByText("View Details")).toBeTruthy();
  });

  test("calls onDetailsPress when View Details is pressed", () => {
    const { getByText } = render(
      <IncidentCard
        incident={mockIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Press the View Details button
    fireEvent.press(getByText("View Details"));

    // Check if onDetailsPress was called with the incident
    expect(mockOnDetailsPress).toHaveBeenCalledTimes(1);
    expect(mockOnDetailsPress).toHaveBeenCalledWith(mockIncident);
  });

  test("handles time ago display", () => {
    const { queryByText } = render(
      <IncidentCard
        incident={mockIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Our mock returns "2 hours ago"
    expect(queryByText("2 hours ago")).toBeTruthy();

    // Check that the helper was called with the right date
    expect(getTimeAgo).toHaveBeenCalledWith(mockIncident.reportedAt);
  });

  test("handles urgent status", () => {
    const urgentIncident = createTestIncident({ severity: "Critical" });
    const { getByText } = render(
      <IncidentCard
        incident={urgentIncident}
        onPress={mockOnPress}
        onDetailsPress={mockOnDetailsPress}
      />,
    );

    // Check if the urgent status is displayed
    expect(getByText("Urgent")).toBeTruthy();
  });
});
