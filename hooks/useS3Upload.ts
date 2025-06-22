import { useAuth0 } from "react-native-auth0";
import { useMutation } from "@tanstack/react-query";
import Constants from "expo-constants";

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
 * Generic S3 upload hook that can be used for any image uploads
 */
export const useS3Upload = () => {
  const { getCredentials } = useAuth0();

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

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Access token not available");
      }

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

  /**
   * Upload image to S3 and return the public URL
   */
  const uploadToS3 = async (
    file: Blob | File,
    fileName: string,
  ): Promise<string> => {
    console.log("[useS3Upload] Starting upload", {
      fileName,
      fileType: file.type,
      fileSize: file.size,
    });

    try {
      // 1. Get presigned URL
      console.log("[useS3Upload] Getting presigned URL");
      const uploadData = await getPresignedUrlMutation.mutateAsync({
        fileName,
        contentType: file.type || "image/jpeg",
      });

      // 2. Upload image to S3
      console.log("[useS3Upload] Uploading to S3");
      await uploadImageMutation.mutateAsync({
        presignedUrl: uploadData.presignedUrl,
        file,
      });

      console.log("[useS3Upload] Upload successful");
      return uploadData.publicUrl;
    } catch (error) {
      console.error("[useS3Upload] Upload failed:", error);
      throw error;
    }
  };

  return {
    uploadToS3,
    isLoading:
      getPresignedUrlMutation.isPending || uploadImageMutation.isPending,
    isError: getPresignedUrlMutation.isError || uploadImageMutation.isError,
    error: getPresignedUrlMutation.error || uploadImageMutation.error,
  };
};
