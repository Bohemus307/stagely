import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

// Helper function to convert S3 URL to CloudFront URL
export const getCloudFrontUrl = (s3Url: string): string | null => {
  if (!s3Url) return null;

  // Extract the S3 key from the URL
  const s3Key = s3Url.split("amazonaws.com/")[1];

  if (!s3Key) return s3Url; // Return original if we can't extract the key

  // Construct CloudFront URL
  return `https://d24y6hzot6c372.cloudfront.net/${s3Key}`;
};

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

// Get status badge color for incidents
export const getIncidentStatusBadge = (status: string | undefined) => {
  // Add a null check before calling toLowerCase()
  if (!status) {
    return "bg-gray-400/80 text-gray-800 rounded-2xl"; // Default style for undefined status
  }
  switch (status.toLowerCase()) {
    case "urgent":
      return "bg-red-400/80 text-white rounded-2xl";
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

export const getStatusIcon = (
  status: string | undefined,
  severity: string | undefined,
) => {
  // Check for urgent first (high or critical severity)
  if (severity === "High" || severity === "Critical") {
    return {
      name: "exclamationmark.triangle" as const,
      color: "red",
    };
  }

  if (!status) {
    return {
      name: "exclamationmark.triangle" as const,
      color: "gray",
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

export const incidentTypes = [
  {
    type: "Water Damage",
    icon: "drop.fill",
    color: "#3b82f6", // blue
    description: "Leaks, flooding, moisture issues",
  },
  {
    type: "Electrical Issue",
    icon: "bolt.fill",
    color: "#eab308", // yellow
    description: "Outlets, wiring, electrical problems",
  },
  {
    type: "Structural Damage",
    icon: "house.fill",
    color: "#a16207", // amber/brown
    description: "Walls, ceilings, foundation issues",
  },
  {
    type: "Plumbing Issue",
    icon: "pipe.and.drop",
    color: "#0ea5e9", // sky blue
    description: "Pipes, drains, fixtures",
  },
  {
    type: "HVAC Problem",
    icon: "thermometer",
    color: "#f97316", // orange
    description: "Heating, cooling, ventilation",
  },
  {
    type: "Pest Infestation",
    icon: "ant.fill",
    color: "#65a30d", // lime
    description: "Insects, rodents, other pests",
  },
  {
    type: "Security Concern",
    icon: "lock.fill",
    color: "#dc2626", // red
    description: "Locks, doors, windows, security systems",
  },
  {
    type: "Appliance Issue",
    icon: "refrigerator",
    color: "#4b5563", // gray
    description: "Kitchen, laundry, or other appliances",
  },
  {
    type: "Other",
    icon: "exclamationmark.circle.fill",
    color: "#6b7280", // gray
    description: "Other incident types",
  },
];

// Helper function to convert URI to Blob (handles ph:// URIs)
export const uriToBlob = async (uri: string): Promise<Blob> => {
  console.log(
    "[uriToBlob] Starting blob creation for URI:",
    uri.substring(0, 30) + "...",
  );

  let tempFileUri: string | null = null;
  let processedUri = uri;

  try {
    // Handle photo library URIs (ph://)
    if (uri.startsWith("ph://")) {
      console.log("[uriToBlob] Detected photo library URI, processing...");

      try {
        // Extract asset ID from the ph:// URI
        const assetId = uri.replace("ph://", "").split("/")[0];
        console.log("[uriToBlob] Extracted asset ID:", assetId);

        // Get asset info to retrieve localUri
        const asset = await MediaLibrary.getAssetInfoAsync(assetId);
        console.log("[uriToBlob] Got asset info:", {
          id: asset.id,
          hasLocalUri: !!asset.localUri,
          hasUri: !!asset.uri,
          filename: asset.filename,
        });

        // Use localUri if available
        if (asset.localUri) {
          console.log("[uriToBlob] Using localUri instead of photo URI");
          processedUri = asset.localUri;
        }
      } catch (assetError) {
        console.log(
          "[uriToBlob] Could not get asset info, falling back to FileSystem:",
          assetError,
        );

        // Fallback: copy the image to a temporary file
        try {
          const timestamp = new Date().getTime() % 1000000;
          const random = Math.floor(Math.random() * 10000);
          const uniqueFileName = `temp_incident_image_${timestamp}_${random}.jpg`;
          tempFileUri = FileSystem.cacheDirectory + uniqueFileName;

          console.log("[uriToBlob] Creating temporary file at:", tempFileUri);

          // Check if file exists and delete if it does
          const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
          if (fileInfo.exists) {
            console.log("[uriToBlob] File already exists, deleting it");
            await FileSystem.deleteAsync(tempFileUri);
          }

          // Copy the photo to temporary file
          await FileSystem.copyAsync({
            from: uri,
            to: tempFileUri,
          });

          console.log("[uriToBlob] Successfully copied to temporary file");
          processedUri = tempFileUri;
        } catch (copyError) {
          console.error("[uriToBlob] Error copying file:", copyError);
          throw new Error(
            `Failed to process photo library image: ${copyError}`,
          );
        }
      }
    }

    // **NEW: Convert HEIC/HEIF to JPEG using Expo ImageManipulator**
    console.log("[uriToBlob] Converting image to JPEG and optimizing...");

    try {
      // Use ImageManipulator to convert any format (including HEIC) to JPEG
      const result = await ImageManipulator.manipulateAsync(
        processedUri,
        [
          // Resize if too large (optional - adjust as needed)
          { resize: { width: 1568 } }, // Maintains aspect ratio, max width 1568px
        ],
        {
          compress: 0.85, // 85% quality for good balance of quality/size
          format: ImageManipulator.SaveFormat.JPEG, // Force JPEG output
        },
      );

      console.log("[uriToBlob] Image converted successfully:", {
        originalUri: processedUri.substring(0, 30) + "...",
        convertedUri: result.uri.substring(0, 30) + "...",
        width: result.width,
        height: result.height,
      });

      // Use the converted image URI
      processedUri = result.uri;
    } catch (conversionError) {
      console.warn(
        "[uriToBlob] Image conversion failed, using original:",
        conversionError,
      );
      // Continue with original URI if conversion fails
    }

    // Fetch and convert to blob
    console.log(
      "[uriToBlob] Fetching from processed URI:",
      processedUri.substring(0, 30) + "...",
    );
    const response = await fetch(processedUri);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`,
      );
    }

    const blob = await response.blob();
    console.log("[uriToBlob] Blob created successfully:", {
      size: blob.size,
      type: blob.type || "image/jpeg",
    });

    // Ensure blob has correct MIME type
    if (!blob.type || blob.type === "application/octet-stream") {
      console.log("[uriToBlob] Fixing blob MIME type to image/jpeg");
      return new Blob([blob], { type: "image/jpeg" });
    }

    return blob;
  } catch (error) {
    console.error("[uriToBlob] Error creating blob:", error);
    throw error;
  } finally {
    // Clean up temporary file if created
    if (tempFileUri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
        if (fileInfo.exists) {
          console.log("[uriToBlob] Cleaning up temporary file:", tempFileUri);
          await FileSystem.deleteAsync(tempFileUri, { idempotent: true });
        }
      } catch (cleanupError) {
        console.log("[uriToBlob] Error during cleanup:", cleanupError);
      }
    }
  }
};
