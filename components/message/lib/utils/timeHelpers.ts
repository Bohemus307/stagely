// Helper function to format time ago
export const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }
};

// Format date for display with timezone handling
export const formatDate = (dateString: string) => {
  try {
    // Parse the date and ensure it's treated as UTC
    const date = new Date(dateString);

    // For ISO format strings that don't specify timezone, force UTC interpretation
    if (dateString.indexOf("Z") === -1 && dateString.indexOf("+") === -1) {
      // Adjust the date by adding the local timezone offset
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      date.setTime(date.getTime() + userTimezoneOffset);
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC", // Always use UTC for display to ensure consistency
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};
