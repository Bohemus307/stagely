import { useAuth0 } from "react-native-auth0";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";

/**
 * Space data interface
 */
export interface SpaceData {
  propertyId: number;
  imageUrl: string;
  metadata?: Record<string, any>;
}

/**
 * Image upload request interface
 */
export interface ImageUploadRequest {
  fileName: string;
  contentType: string;
}

/**
 * Image upload response interface
 */
export interface ImageUploadResponse {
  presignedUrl: string;
  publicUrl: string;
}

/**
 * Create space request interface
 */
export interface CreateSpaceRequest {
  propertyId: number;
  imageUrl: string;
  metadata?: Record<string, any>;
}

/**
 * Create space response interface
 */
export interface CreateSpaceResponse {
  id: number;
  propertyId: number;
  name: string | null;
  type: string;
  aiGenerated: boolean;
  featureVector: any | null;
  confidenceScore: string | null;
  createdAt: string;
  updatedAt: string;
  objectLabels: {
    id: number;
    spaceId: number;
    name: string;
    confidence: string;
    category: string | null;
    createdAt: string;
  }[];
  images: {
    id: number;
    inspectionId: number;
    spaceId: number | null;
    imageUrl: string;
    caption: string | null;
    takenAt: string;
    metadata: any | null;
    featureVector: any | null;
    createdAt: string;
    updatedAt: string;
  }[];
  property: {
    id: number;
    address: string;
    city: string;
    state: string | null;
    zipCode: string | null;
    country: string;
    status: string;
  };
}

/**
 * Custom hook for uploading images and creating spaces
 */
export const useCreateSpace = () => {
  const { getCredentials } = useAuth0();
  const queryClient = useQueryClient();

  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  // Mutation to get presigned URL for image upload
  const getPresignedUrlMutation = useMutation<
    ImageUploadResponse,
    Error,
    ImageUploadRequest
  >({
    mutationFn: async (request: ImageUploadRequest) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Get presigned URL from the backend
      const response = await fetch(`https://${apiUrl}/s3/get-presigned-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
  });

  // Mutation to upload image to S3 using presigned URL
  const uploadImageMutation = useMutation<
    void,
    Error,
    { presignedUrl: string; file: Blob | File }
  >({
    mutationFn: async ({ presignedUrl, file }) => {
      const response = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload error: ${response.status}`);
      }
    },
  });

  // Mutation to create space with uploaded image
  const createSpaceMutation = useMutation<
    CreateSpaceResponse,
    Error,
    CreateSpaceRequest
  >({
    mutationFn: async (spaceData: CreateSpaceRequest) => {
      if (!apiUrl) {
        throw new Error("API URL not available");
      }

      // Get the access token
      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

      // Create space in the backend
      const response = await fetch(`https://${apiUrl}/properties/spaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${credentials.accessToken}`,
        },
        body: JSON.stringify(spaceData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the spaces queries to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  /**
   * Upload image and create space
   * @param propertyId Property ID to associate the space with
   * @param file Image file to upload
   * @param fileName Name of the file
   * @param metadata Additional metadata for the space
   * @returns Promise resolving to the created space
   */
  const uploadImageAndCreateSpace = async (
    propertyId: number,
    file: Blob | File,
    fileName: string,
    metadata?: Record<string, any>,
  ) => {
    console.log("[useCreateSpace] Starting uploadImageAndCreateSpace", {
      propertyId,
      fileName,
      fileType: file.type,
      fileSize: file.size,
      metadata,
    });

    try {
      // 1. Get presigned URL
      console.log(
        "[useCreateSpace] Step 1: Getting presigned URL for",
        fileName,
      );
      const uploadData = await getPresignedUrlMutation.mutateAsync({
        fileName,
        contentType: file.type,
      });
      console.log("[useCreateSpace] Got presigned URL successfully", {
        presignedUrl: uploadData.presignedUrl.substring(0, 50) + "...", // Log partial URL for privacy
        publicUrl: uploadData.publicUrl.substring(0, 50) + "...",
      });

      // 2. Upload image to S3
      console.log("[useCreateSpace] Step 2: Uploading image to S3");
      await uploadImageMutation.mutateAsync({
        presignedUrl: uploadData.presignedUrl,
        file,
      });
      console.log("[useCreateSpace] Image uploaded successfully to S3");

      // 3. Create space with the public URL
      console.log("[useCreateSpace] Step 3: Creating space with image URL");
      const result = await createSpaceMutation.mutateAsync({
        propertyId,
        imageUrl: uploadData.publicUrl,
        metadata,
      });
      console.log("[useCreateSpace] Space created successfully", {
        spaceId: result.id,
        propertyId: result.propertyId,
        type: result.type,
      });

      return result;
    } catch (error) {
      console.error("[useCreateSpace] Failed to create space:", error);
      // Log more details about the error
      if (error instanceof Error) {
        console.error("[useCreateSpace] Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  };

  return {
    uploadImageAndCreateSpace,
    getPresignedUrl: getPresignedUrlMutation.mutate,
    uploadToS3: uploadImageMutation.mutate,
    createSpace: createSpaceMutation.mutate,
    isLoading:
      getPresignedUrlMutation.isPending ||
      uploadImageMutation.isPending ||
      createSpaceMutation.isPending,
    isSuccess: createSpaceMutation.isSuccess,
    isError:
      getPresignedUrlMutation.isError ||
      uploadImageMutation.isError ||
      createSpaceMutation.isError,
    error:
      getPresignedUrlMutation.error ||
      uploadImageMutation.error ||
      createSpaceMutation.error,
    data: createSpaceMutation.data,
    reset: () => {
      getPresignedUrlMutation.reset();
      uploadImageMutation.reset();
      createSpaceMutation.reset();
    },
  };
};
