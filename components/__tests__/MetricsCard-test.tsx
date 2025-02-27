import React from "react";
import { render } from "@testing-library/react-native";
import MetricsCard from "../MetricsCard";
import { Text, View } from "react-native";

jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
}));

jest.mock("@/components/ui/hstack", () => ({
  HStack: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

jest.mock("@/components/ui/box", () => ({
  Box: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

describe("MetricsCard Component", () => {
  it("renders correctly and displays correct counts", async () => {
    const { getByText } = render(<MetricsCard />);

    expect(getByText("Active Properties")).toBeTruthy();
    expect(getByText("Open Incidents")).toBeTruthy();
    expect(getByText("3")).toBeTruthy(); // Three properties
    expect(getByText("2")).toBeTruthy(); // Two incidents
  });
});
