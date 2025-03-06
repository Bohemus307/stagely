

// Helper function to format time ago
export const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

// Get status badge color for incidents
export const getIncidentStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "urgent":
      return "bg-red-500 text-white rounded-2xl";
    case "open":
      return "bg-amber-400/80 text-amber-800 rounded-2xl";
    case "resolved":
      return "bg-green-400/80 text-green-800 rounded-2xl";
    case "in progress":
      return "bg-blue-400/80 text-blue-800 rounded-2xl";
    case "pending":
      return "bg-amber-400/80 text-amber-800 rounded-2xl";
    case "closed":
      return "bg-gray-400/80 text-gray-800 rounded-2xl";
    default:
      return "bg-gray-400/80 text-gray-800 rounded-2xl";
    }
  };

  export const getStatusIcon = (status: string, severity: string) => {
    // Check for urgent first (high or critical severity)
    if (severity === "High" || severity === "Critical") {
      return {
        name: "exclamationmark.triangle" as const,
        color: "red",
      };
    }

    // Otherwise based on status
    switch (status.toLowerCase()) {
      case "resolved":
        return {
          name: "checkmark.circle" as const,
          color: "green",
        };
      case "in progress":
        return {
          name: "gear" as const,
          color: "blue",
        };
      case "open":
        return {
          name: "gear" as const,
          color: "yellow",
        };
      case "closed":
        return {
          name: "lock" as const,
          color: "gray",
        };
      default:
        return {
          name: "exclamationmark.triangle" as const,
          color: "gray",
        };
    }
  };
