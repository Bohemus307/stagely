import React from "react";
import { render } from "@testing-library/react-native";
import PropertyDetails from "@/components/properties/details/PropertyDetails";
import { formatDate } from "@/components/properties/lib/utils/detailsHelpers";
import { Property, PropertyStatus } from "@/components/properties/list";

// Mock the formatDate helper
jest.mock("@/components/properties/lib/utils/detailsHelpers.ts", () => ({
  formatDate: jest.fn((date) => `Formatted: ${date}`),
}));

describe("PropertyDetails", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Sample property data
  const mockProperty: Property = {
    property_id: 12345,
    address: "123 Test Street",
    city: "Test City",
    state: "TS",
    zip_code: "12345",
    country: "Test Country",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    status: PropertyStatus.Active,
    images: [],
    incidents: [],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-02-01T00:00:00Z",
  };

  test("renders correctly with property data", () => {
    const { getByText } = render(<PropertyDetails property={mockProperty} />);

    // Check if property ID is displayed correctly
    expect(getByText("Property ID")).toBeTruthy();
    expect(getByText("12345")).toBeTruthy();

    // Check if the dates are displayed (using the mocked formatDate function)
    expect(getByText("Added On")).toBeTruthy();
    expect(getByText("Formatted: 2025-01-01T00:00:00Z")).toBeTruthy();

    expect(getByText("Last Updated")).toBeTruthy();
    expect(getByText("Formatted: 2025-02-01T00:00:00Z")).toBeTruthy();
  });

  test("formatDate is called with correct dates", () => {
    render(<PropertyDetails property={mockProperty} />);

    // Verify that formatDate was called with the correct parameters
    expect(formatDate).toHaveBeenCalledTimes(2);
    expect(formatDate).toHaveBeenNthCalledWith(1, "2025-01-01T00:00:00Z");
    expect(formatDate).toHaveBeenNthCalledWith(2, "2025-02-01T00:00:00Z");
  });

  test("handles property with missing dates gracefully", () => {
    const propertyWithMissingDates = {
      ...mockProperty,
      created_at: undefined,
      updated_at: null,
    };

    const { getByText } = render(
      <PropertyDetails
        property={propertyWithMissingDates as unknown as Property}
      />,
    );

    // Component should still render without crashing
    expect(getByText("Property ID")).toBeTruthy();

    // formatDate would be called with undefined/null
    expect(formatDate).toHaveBeenCalledTimes(2);
  });

  test("renders with extremely large property ID", () => {
    const propertyWithLargeId = {
      ...mockProperty,
      property_id: 999999999999999,
    };

    const { getByText } = render(
      <PropertyDetails property={propertyWithLargeId as Property} />,
    );

    // Check if the large ID is displayed correctly
    expect(getByText("999999999999999")).toBeTruthy();
  });

  test("renders with string dates instead of ISO format", () => {
    const propertyWithStringDates = {
      ...mockProperty,
      created_at: "January 1, 2025",
      updated_at: "February 1, 2025",
    };

    render(<PropertyDetails property={propertyWithStringDates as Property} />);

    // Verify formatDate was called with the string dates
    expect(formatDate).toHaveBeenNthCalledWith(1, "January 1, 2025");
    expect(formatDate).toHaveBeenNthCalledWith(2, "February 1, 2025");
  });
});
