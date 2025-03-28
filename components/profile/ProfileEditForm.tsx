import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { VStack } from "@/components/ui/vstack";
import { Input, InputField } from "@/components/ui/input";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { ThemedText } from "@/components/ThemedText";
import useS3ImageUpload from "@/hooks/useImageUpload";
import { User } from "@/lib/@types/properties";
import { UpdateUserData } from "@/hooks/profile/useUpdateUser";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ProfileFormProps {
  userData: User;
  onSave: (data: UpdateUserData) => void;
  isSaving: boolean;
  error?: string;
}

const ProfileEdit: React.FC<ProfileFormProps> = ({
  userData,
  onSave,
  isSaving,
  error,
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email,
    phone: userData.phone || "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Image upload hook
  const {
    image,
    uploading: uploadingImage,
    pickImage,
    uploadToS3,
  } = useS3ImageUpload();

  const handleChange = (field: keyof FormData, value: string) => {
    if (field === "email") return;

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSelectProfilePicture = async () => {
    try {
      await pickImage();
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Failed to select image.");
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameRegex = /^[A-Za-z\s'-]+$/;

    if (formData.firstName.trim() === "") {
    } else if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName =
        "First name should only contain letters, spaces, hyphens, and apostrophes";
    }

    if (formData.lastName.trim() === "") {
    } else if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName =
        "Last name should only contain letters, spaces, hyphens, and apostrophes";
    }

    if (formData.phone && !/^\+?[0-9\s-()]{7,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSaving || uploadingImage) return;

    try {
      let profilePictureUrl = userData.profilePictureUrl;

      if (image) {
        const uploadResult = await uploadToS3();
        if (uploadResult?.success && uploadResult.url) {
          profilePictureUrl = uploadResult.url;
        }
      }

      const updateData: UpdateUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        profilePictureUrl: profilePictureUrl,
      };

      onSave(updateData);
    } catch (error) {
      console.error("Error handling profile form submission:", error);
    }
  };

  return (
    <View className="flex-1">
      <View className="items-center my-6">
        <Avatar size="xl" className="mb-2">
          {image?.uri || userData.profilePictureUrl ? (
            <AvatarImage
              source={{
                uri: image?.uri || userData.profilePictureUrl,
              }}
            />
          ) : (
            <AvatarFallbackText>
              {formData.firstName.charAt(0)}
              {formData.lastName.charAt(0)}
            </AvatarFallbackText>
          )}
        </Avatar>

        <Button
          className="bg-white rounded-lg"
          variant="outline"
          size="sm"
          onPress={handleSelectProfilePicture}
          disabled={uploadingImage || isSaving}
        >
          <HStack className="items-center">
            <IconSymbol name="photo" size={16} color={"#0891b2"} />
            <ButtonText className="ml-1">
              {uploadingImage ? "Uploading..." : "Change Photo"}
            </ButtonText>
          </HStack>
        </Button>
      </View>

      {error && (
        <ThemedText className="text-red-500 text-center mb-4">
          {error}
        </ThemedText>
      )}

      <VStack space="lg" className="mb-6 px-4">
        <FormControl isInvalid={!!validationErrors.firstName}>
          <FormControlLabel>
            <FormControlLabelText>First Name</FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-white my-1 rounded-lg">
            <InputField
              placeholder="Enter your first name"
              value={formData.firstName}
              onChangeText={(value) => handleChange("firstName", value)}
            />
          </Input>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>
              {validationErrors.firstName}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      <VStack space="lg" className="mb-6 px-4">
        <FormControl isInvalid={!!validationErrors.lastName}>
          <FormControlLabel>
            <FormControlLabelText>Last Name</FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-white my-1 rounded-lg">
            <InputField
              placeholder="Enter your last name"
              value={formData.lastName}
              onChangeText={(value) => handleChange("lastName", value)}
            />
          </Input>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>
              {validationErrors.lastName}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      <VStack space="lg" className="mb-6 px-4">
        <FormControl isReadOnly={true}>
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-white my-1 rounded-lg opacity-70">
            <InputField
              placeholder="Email address"
              value={formData.email}
              editable={false}
            />
          </Input>
          <FormControlHelper>
            <FormControlHelperText>
              Email address cannot be changed
            </FormControlHelperText>
          </FormControlHelper>
        </FormControl>
      </VStack>

      <VStack space="lg" className="mb-6 px-4">
        <FormControl isInvalid={!!validationErrors.phone}>
          <FormControlLabel>
            <FormControlLabelText>Phone (Optional)</FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-white my-1 rounded-lg">
            <InputField
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => handleChange("phone", value)}
              keyboardType="phone-pad"
            />
          </Input>
          <FormControlHelper>
            <FormControlHelperText>
              Used for verification and account recovery
            </FormControlHelperText>
          </FormControlHelper>
          <FormControlError>
            <FormControlErrorIcon as={AlertCircleIcon} />
            <FormControlErrorText>
              {validationErrors.phone}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      <VStack className="mb-12 px-4">
        <Button
          variant="solid"
          isDisabled={isSaving || uploadingImage}
          onPress={handleSubmit}
          className="mt-4 rounded-lg"
        >
          {isSaving || uploadingImage ? (
            <HStack className="items-center justify-center">
              <Spinner size="small" color="white" />
              <ButtonText className="ml-2">Saving...</ButtonText>
            </HStack>
          ) : (
            <ButtonText>Save Changes</ButtonText>
          )}
        </Button>
      </VStack>
    </View>
  );
};

export default ProfileEdit;
