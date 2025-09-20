import React from "react";
import { render } from "@testing-library/react-native";
import RecentIncidents from "@/components/properties/details/RecentIncidents";
import {
  IncidentImage,
  Incident,
  Property,
  PropertyStatus,
  IncidentStatus,
  IncidentSeverity,
} from "@/lib/@types/properties";

// Just mock router for navigation testing
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
  },
}));

describe("RecentIncidents Component", () => {
  // Sample incident data
  const createIncident = (
    id: number,
    type: string,
    description: string,
    status: IncidentStatus,
    severity: IncidentSeverity,
    images: IncidentImage[] = [],
  ): Incident => ({
    propertyId: 12345,
    id: id,
    incidentType: type,
    description,
    reportedAt: "2025-02-15T10:30:00Z",
    severity,
    status,
    images,
    createdAt: "",
    updatedAt: "",
    aiClassified: false,
  });

  // Create multiple incidents
  const mockIncidents: Incident[] = [
    createIncident(
      101,
      "Plumbing",
      "Water leak in bathroom",
      IncidentStatus.Open,
      IncidentSeverity.Medium,
    ),
    createIncident(
      102,
      "Electrical",
      "Power outage in living room",
      IncidentStatus.Resolved,
      IncidentSeverity.High,
      [],
    ),
    createIncident(
      103,
      "HVAC",
      "AC not working",
      IncidentStatus.InProgress,
      IncidentSeverity.Low,
    ),
    createIncident(
      104,
      "Structural",
      "Crack in ceiling",
      IncidentStatus.Open,
      IncidentSeverity.High,
    ),
  ];

  // Create an incident with images
  const mockIncidentWithImages: Incident = createIncident(
    105,
    "Damage",
    "Wall damage in living room",
    IncidentStatus.Open,
    IncidentSeverity.Medium,
    [
      {
        id: 201,
        imageUrl: "https://example.com/image1.jpg",
        caption: "Image 1",
        takenAt: "2025-02-18T11:25:00Z",
        incidentId: 0,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 202,
        imageUrl: "https://example.com/image2.jpg",
        caption: "Image 2",
        takenAt: "2025-02-18T11:25:00Z",
        incidentId: 0,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 203,
        imageUrl: "https://example.com/image3.jpg",
        caption: "Image 3",
        takenAt: "2025-02-18T11:25:00Z",
        incidentId: 0,
        createdAt: "",
        updatedAt: "",
      },
      {
        id: 204,
        imageUrl: "https://example.com/image4.jpg",
        caption: "Image 4",
        takenAt: "2025-02-18T11:25:00Z",
        incidentId: 0,
        createdAt: "",
        updatedAt: "",
      },
    ],
  );

  // Create base property
  const createProperty = (incidents: Incident[] = []): Property => ({
    id: 12345,
    address: "123 Test Street",
    city: "Test City",
    state: "TS",
    zipCode: "12345",
    country: "Test Country",
    latitude: 37.7749,
    longitude: -122.4194,
    status: PropertyStatus.Active,
    incidents,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-02-01T00:00:00Z",
    propertyId: 0,
    userId: 0,
    incidentCount: 0,
    openIncidentCount: 0,
  });

  const mockProperty = createProperty([
    ...mockIncidents,
    mockIncidentWithImages,
  ]);
  const propertyWithFewerIncidents = createProperty(mockIncidents.slice(0, 2));
  const propertyWithNoIncidents = createProperty([]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the component title correctly", () => {
    const { getByText } = render(<RecentIncidents property={mockProperty} />);
    expect(getByText("Recent Incidents")).toBeTruthy();
  });

  test("displays only the first 3 incidents when there are more than 3", () => {
    const { queryByText } = render(<RecentIncidents property={mockProperty} />);

    // Should show first 3 incidents
    expect(queryByText("Plumbing")).toBeTruthy();
    expect(queryByText("Electrical")).toBeTruthy();
    expect(queryByText("HVAC")).toBeTruthy();

    // Should not show the 4th incident
    expect(queryByText("Structural")).toBeFalsy();
  });

  test("displays incident details correctly", () => {
    const { getByText } = render(<RecentIncidents property={mockProperty} />);

    // Check incident type
    expect(getByText("Plumbing")).toBeTruthy();

    // Check incident description
    expect(getByText("Water leak in bathroom")).toBeTruthy();

    // Check incident status
    expect(getByText("Open")).toBeTruthy();

    // Check incident severity
    expect(getByText("Medium Priority")).toBeTruthy();
  });

  test("does not display View All button when there are 3 or fewer incidents", () => {
    const { queryByText } = render(
      <RecentIncidents property={propertyWithFewerIncidents} />,
    );
    expect(queryByText(/View All/)).toBeFalsy();
  });

  test("handles incidents with images correctly", () => {
    const propertyWithImageIncident = createProperty([mockIncidentWithImages]);

    const { getByText } = render(
      <RecentIncidents property={propertyWithImageIncident} />,
    );

    // Should display the incident type
    expect(getByText("Damage")).toBeTruthy();

    // Should show a +1 indicator for additional images
    expect(getByText("+1")).toBeTruthy();
  });

  test("handles property with no incidents gracefully", () => {
    const { queryByText } = render(
      <RecentIncidents property={propertyWithNoIncidents} />,
    );

    // Should still show the heading
    expect(queryByText("Recent Incidents")).toBeTruthy();

    // Should not display any incidents
    expect(queryByText("Plumbing")).toBeFalsy();
    expect(queryByText("Electrical")).toBeFalsy();

    // Should not show View All button
    expect(queryByText(/View All/)).toBeFalsy();
  });

  test("handles undefined incidents array gracefully", () => {
    const propertyWithUndefinedIncidents = {
      ...mockProperty,
      incidents: undefined,
    };

    const { queryByText } = render(
      <RecentIncidents property={propertyWithUndefinedIncidents} />,
    );

    // Should still show the heading
    expect(queryByText("Recent Incidents")).toBeTruthy();

    // Should not crash or display any incidents
    expect(queryByText("Plumbing")).toBeFalsy();
  });
});
