// Import React and testing utilities
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

// Import the component under test
import QuickActions from "@/components/dashboard/QuickActions";

// First, mock the most problematic dependencies
jest.mock("@/components/incidents/AddIncidentButton", () => {
  return function MockAddIncidentButton() {
    return <div data-testid="mock-add-incident">New Incident</div>;
  };
});

jest.mock("expo-router", () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}));

describe("QuickActions Component", () => {
  it("renders correctly", () => {
    const { getByText } = render(<QuickActions />);

    // Check if the component renders the expected text
    expect(getByText("Quick Actions")).toBeTruthy();
    expect(getByText("Add Property")).toBeTruthy();
  });

  it("navigates to the correct route when Add Property is pressed", () => {
    const { getByText } = render(<QuickActions />);

    // Get the router mock
    const { push } = require("expo-router").useRouter();

    // Simulate pressing the "Add Property" button
    fireEvent.press(getByText("Add Property"));

    // Verify navigation
    expect(push).toHaveBeenCalledWith("/(tabs)/(dashboard)/addProperty");
  });
});
