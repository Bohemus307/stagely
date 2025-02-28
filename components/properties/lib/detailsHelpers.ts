import { PropertyStatus } from "../list";
// Determine status badge color and text based on property status
export const getStatusBadge = (status: PropertyStatus) => {
  switch (status) {
    case PropertyStatus.Archived:
      return { text: "Archived", color: "bg-gray-400/80" };
    case PropertyStatus.Maintenance:
      return { text: "Maintenance", color: "bg-amber-400/80" };
    case PropertyStatus.Active:
    default:
      return { text: "Active", color: "bg-green-400/80" };
  }
};

// Format date for display with timezone handling
export const formatDate = (dateString: string) => {
  try {
    // Parse the date and ensure it's treated as UTC
    const date = new Date(dateString);
    
    // For ISO format strings that don't specify timezone, force UTC interpretation
    if (dateString.indexOf('Z') === -1 && dateString.indexOf('+') === -1) {
      // Adjust the date by adding the local timezone offset
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      date.setTime(date.getTime() + userTimezoneOffset);
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: 'UTC' // Always use UTC for display to ensure consistency
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Get severity badge color
export const getSeverityBadge = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-amber-100 text-amber-800";
    case "low":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get status badge color for incidents
export const getIncidentStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "resolved":
      return "bg-green-100 text-green-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
