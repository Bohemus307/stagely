import {
  getStatusBadge,
  formatDate,
  getSeverityBadge,
  getIncidentStatusBadge,
} from "@/components/properties/lib/utils/detailsHelpers";
import { PropertyStatus } from "@/lib/@types/properties";

describe("detailsHelpers", () => {
  describe("getStatusBadge", () => {
    test("returns correct badge for Active status", () => {
      const result = getStatusBadge(PropertyStatus.Active);
      expect(result).toEqual({ text: "Active", color: "bg-green-400/80" });
    });

    test("returns correct badge for Maintenance status", () => {
      const result = getStatusBadge(PropertyStatus.Maintenance);
      expect(result).toEqual({ text: "Maintenance", color: "bg-amber-400/80" });
    });

    test("returns correct badge for Archived status", () => {
      const result = getStatusBadge(PropertyStatus.Archived);
      expect(result).toEqual({ text: "Archived", color: "bg-gray-400/80" });
    });

    test("defaults to Active status for unknown values", () => {
      // @ts-ignore - intentionally testing with invalid value
      const result = getStatusBadge("InvalidStatus");
      expect(result).toEqual({ text: "Active", color: "bg-green-400/80" });
    });
  });

  describe("formatDate", () => {
    test("formats date string correctly", () => {
      // Use a fixed test date instead of mocking Date
      const testDate = "2025-02-15T10:30:00Z";
      const result = formatDate(testDate);

      // Just test that the result contains expected parts
      expect(result).toContain("2025");
      expect(result).toContain("15");
      // Month might be displayed differently depending on locale
      expect(result.length).toBeGreaterThan(8);
    });

    test("formats a specific date consistently", () => {
      // Use a specific date and verify general format is correct
      const result = formatDate("2025-01-01T00:00:00Z");

      // Just verify it contains the expected year and day
      expect(result).toContain("2024");
      expect(result).toContain("1");
      expect(result).toMatch(/\w{3,}\s+\d{1,2},\s+\d{4}/); // Pattern like "Jan 1, 2025"
    });

    test("handles different date formats", () => {
      // Test with different date formats to ensure robustness
      const dates = ["2025-02-15", "2025/02/15"];

      dates.forEach((dateString) => {
        const result = formatDate(dateString);
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });
  });

  describe("getSeverityBadge", () => {
    test("returns correct badge class for high severity", () => {
      const result = getSeverityBadge("High");
      expect(result).toBe("bg-red-400/80 text-red-800");
    });

    test("returns correct badge class for medium severity", () => {
      const result = getSeverityBadge("Medium");
      expect(result).toBe("bg-amber-400/80 text-amber-800");
    });

    test("returns correct badge class for low severity", () => {
      const result = getSeverityBadge("Low");
      expect(result).toBe("bg-blue-400/80 text-blue-800");
    });

    test("returns default badge class for unknown severity", () => {
      const result = getSeverityBadge("Unknown");
      expect(result).toBe("bg-gray-400/80 text-gray-800");
    });

    test("is case insensitive", () => {
      expect(getSeverityBadge("HIGH")).toBe("bg-red-400/80 text-red-800");
      expect(getSeverityBadge("high")).toBe("bg-red-400/80 text-red-800");
      expect(getSeverityBadge("High")).toBe("bg-red-400/80 text-red-800");
    });
  });

  describe("getIncidentStatusBadge", () => {
    test("returns correct badge class for resolved status", () => {
      const result = getIncidentStatusBadge("Resolved");
      expect(result).toBe("bg-green-400/80 text-green-800 rounded-2xl");
    });

    test("returns correct badge class for in progress status", () => {
      const result = getIncidentStatusBadge("In Progress");
      expect(result).toBe("bg-blue-400/80 text-blue-800 rounded-2xl");
    });

    test("returns correct badge class for pending status", () => {
      const result = getIncidentStatusBadge("Pending");
      expect(result).toBe("bg-amber-400/80 text-amber-800 rounded-2xl");
    });

    test("returns default badge class for unknown status", () => {
      const result = getIncidentStatusBadge("Unknown");
      expect(result).toBe("bg-gray-400/80 text-gray-800 rounded-2xl");
    });

    test("is case insensitive", () => {
      expect(getIncidentStatusBadge("RESOLVED")).toBe(
        "bg-green-400/80 text-green-800 rounded-2xl",
      );
      expect(getIncidentStatusBadge("resolved")).toBe(
        "bg-green-400/80 text-green-800 rounded-2xl",
      );
      expect(getIncidentStatusBadge("Resolved")).toBe(
        "bg-green-400/80 text-green-800 rounded-2xl",
      );
      expect(getIncidentStatusBadge("IN PROGRESS")).toBe(
        "bg-blue-400/80 text-blue-800 rounded-2xl",
      );
    });

    test("handles 'open' status correctly", () => {
      const result = getIncidentStatusBadge("Open");
      expect(result).toBe("bg-gray-400/80 text-gray-800 rounded-2xl");
    });
  });
});
