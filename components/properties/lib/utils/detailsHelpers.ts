// Determine status badge color and text based on property status
export const getStatusBadge = (status: string) => {
  switch (status) {
    case "Archived":
      return { text: "Archived", color: "bg-gray-400/80" };
    case "Maintenance":
      return { text: "Maintenance", color: "bg-amber-400/80" };
    case "Active":
    default:
      return { text: "Active", color: "bg-green-400/80" };
  }
};

/**
 * Format date for display
 * Handles ISO date strings like "2025-03-20T15:59:43.516Z"
 */
export const formatDate = (dateString: string): string => {
  // Return early if dateString is empty or undefined
  if (!dateString) return "Unknown date";

  try {
    // Create a date object from the string
    const date = new Date(dateString);

    // Validate the date - if invalid, throw an error to trigger the catch block
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date format");
    }

    // Format using toLocaleDateString with desired options
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error, "for string:", dateString);
    return dateString; // Return the original string as fallback
  }
};

// Get severity badge color
export const getSeverityBadge = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "high":
      return "bg-red-400/80 text-red-800 rounded-xl";
    case "medium":
      return "bg-amber-400/80 text-amber-800 rounded-xl";
    case "low":
      return "bg-blue-400/80 text-blue-800 rounded-xl";
    default:
      return "bg-gray-400/80 text-gray-800 rounded-xl";
  }
};

// Get status badge color for incidents
export const getIncidentStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "urgent":
      return "bg-red-400/80 text-red-800 rounded-2xl";
    case "resolved":
      return "bg-green-400/80 text-green-800 rounded-2xl";
    case "in progress":
      return "bg-blue-400/80 text-blue-800 rounded-2xl";
    case "pending":
      return "bg-amber-400/80 text-amber-800 rounded-2xl";
    default:
      return "bg-gray-400/80 text-gray-800 rounded-2xl";
  }
};
