// hooks/useS3ImageUpload.ts
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { MediaType } from "expo-image-picker";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";
import Constants from "expo-constants";

// Define types for the image asset
interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  fileSize?: number;
  type?: string;
  fileName?: string;
}

// Options for the hook
interface S3ImageUploadOptions {
  apiEndpoint?: string;
  imagePickerOptions?: Omit<ImagePicker.ImagePickerOptions, "mediaTypes"> & {
    mediaTypes?: MediaType[];
  };
  cameraOptions?: Omit<ImagePicker.ImagePickerOptions, "mediaTypes"> & {
    mediaTypes?: MediaType[];
  };
}

// Return type from the upload function
interface UploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

// Hook return type
interface S3ImageUploadReturn {
  image: ImageAsset | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedImageUrl: string | null;
  pickImage: () => Promise<ImageAsset | null>;
  takePhoto: () => Promise<ImageAsset | null>;
  captureImage: (source?: "camera" | "library") => Promise<ImageAsset | null>;
  uploadToS3: (
    imageToUpload?: ImageAsset | null,
  ) => Promise<UploadResult | null>;
  pickAndUpload: () => Promise<UploadResult | null>;
  takePhotoAndUpload: () => Promise<UploadResult | null>;
  captureAndUpload: (
    source?: "camera" | "library",
  ) => Promise<UploadResult | null>;
  resetUpload: () => void;
  setImage: React.Dispatch<React.SetStateAction<ImageAsset | null>>;
}

/**
 * Custom hook for handling image uploads to AWS S3 from React Native
 *
 * @param options - Configuration options for the hook
 * @returns Object containing image state and upload functions
 */
const useS3ImageUpload = (
  options: S3ImageUploadOptions = {},
): S3ImageUploadReturn => {
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const [image, setImage] = useState<ImageAsset | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const {
    apiEndpoint = apiUrl,
    imagePickerOptions = {
      mediaTypes: ["image" as MediaType],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    },
    cameraOptions = {
      mediaTypes: ["image" as MediaType],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    },
  } = options;

  /**
   * Request permissions for media library access
   * @returns Promise resolving to a boolean indicating if permission was granted
   */
  const requestMediaLibraryPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError("Permission to access media library was denied");
      return false;
    }
    return true;
  };

  /**
   * Request permissions for camera access
   * @returns Promise resolving to a boolean indicating if permission was granted
   */
  const requestCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError("Permission to access camera was denied");
      return false;
    }
    return true;
  };

  /**
   * Pick an image from the media library
   * @returns Promise resolving to the selected image asset or null
   */
  const pickImage = async (): Promise<ImageAsset | null> => {
    setError(null);

    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) return null;

    try {
      const result =
        await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0] as ImageAsset;
        setImage(selectedImage);
        return selectedImage;
      }
    } catch (err) {
      const error = err as Error;
      setError("Error picking image: " + error.message);
    }

    return null;
  };

  /**
   * Take a photo using the device camera
   * @returns Promise resolving to the captured image asset or null
   */
  const takePhoto = async (): Promise<ImageAsset | null> => {
    setError(null);

    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync(cameraOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const capturedImage = result.assets[0] as ImageAsset;
        setImage(capturedImage);
        return capturedImage;
      }
    } catch (err) {
      const error = err as Error;
      setError("Error taking photo: " + error.message);
    }

    return null;
  };

  /**
   * Reset the upload state
   */
  const resetUpload = (): void => {
    setImage(null);
    setUploadedImageUrl(null);
    setError(null);
    setProgress(0);
  };

  /**
   * Upload an image to AWS S3
   * @param imageToUpload - Optional image asset to upload (defaults to current image state)
   * @returns Promise resolving to the upload result
   */
  const uploadToS3 = async (
    imageToUpload: ImageAsset | null = image,
  ): Promise<UploadResult | null> => {
    if (!imageToUpload) {
      setError("No image selected");
      return null;
    }

    if (!imageToUpload.base64) {
      setError("Image does not have base64 data");
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Generate a unique filename
      const fileName = `${uuidv4()}.jpg`;

      // Request pre-signed URL from backend
      const urlResponse = await fetch(`${apiEndpoint}/s3/get-presigned-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          contentType: "image/jpeg",
        }),
      });

      if (!urlResponse.ok) {
        throw new Error(
          `Failed to get pre-signed URL: ${urlResponse.statusText}`,
        );
      }

      const { presignedUrl, publicUrl } = await urlResponse.json();

      // Convert base64 to binary for upload
      const imageBuffer = Buffer.from(imageToUpload.base64, "base64");

      // Upload to S3 with the pre-signed URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: imageBuffer,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload to S3: ${uploadResponse.statusText}`);
      }

      // Set the final uploaded URL
      setUploadedImageUrl(publicUrl);
      setProgress(100);

      return {
        success: true,
        url: publicUrl,
        fileName,
      };
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An error occurred during upload");
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setUploading(false);
    }
  };

  /**
   * Pick an image from the media library and upload it in one step
   * @returns Promise resolving to the upload result
   */
  const pickAndUpload = async (): Promise<UploadResult | null> => {
    const pickedImage = await pickImage();
    if (pickedImage) {
      return uploadToS3(pickedImage);
    }
    return null;
  };

  /**
   * Take a photo with the camera and upload it in one step
   * @returns Promise resolving to the upload result
   */
  const takePhotoAndUpload = async (): Promise<UploadResult | null> => {
    const takenPhoto = await takePhoto();
    if (takenPhoto) {
      return uploadToS3(takenPhoto);
    }
    return null;
  };

  /**
   * Generic function that allows choosing between camera and library
   * @param source - The source to capture from ('camera' or 'library')
   * @returns Promise resolving to the captured image asset
   */
  const captureImage = async (
    source: "camera" | "library" = "library",
  ): Promise<ImageAsset | null> => {
    if (source === "camera") {
      return takePhoto();
    } else {
      return pickImage();
    }
  };

  /**
   * Generic function that combines capture and upload
   * @param source - The source to capture from ('camera' or 'library')
   * @returns Promise resolving to the upload result
   */
  const captureAndUpload = async (
    source: "camera" | "library" = "library",
  ): Promise<UploadResult | null> => {
    const capturedImage = await captureImage(source);
    if (capturedImage) {
      return uploadToS3(capturedImage);
    }
    return null;
  };

  return {
    image,
    uploading,
    progress,
    error,
    uploadedImageUrl,
    pickImage,
    takePhoto,
    captureImage,
    uploadToS3,
    pickAndUpload,
    takePhotoAndUpload,
    captureAndUpload,
    resetUpload,
    setImage,
  };
};

export default useS3ImageUpload;
