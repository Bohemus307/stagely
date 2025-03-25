import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";
import { useAuth0 } from "react-native-auth0";
import { useAuthUser } from "@/hooks/useAuthUser";
import useS3ImageUpload from "@/hooks/useImageUpload";
import { router } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
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
import Constants from "expo-constants";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const EditProfileScreen = () => {
  const apiUrl =
    Constants.expoConfig?.extra?.stagelyApiUrl || process.env.STAGELY_API_URL;

  const { getCredentials } = useAuth0();
  const { auth0User, backendUser, isLoading, error, refetch } = useAuthUser();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Image upload hook
  const {
    image,
    uploading: uploadingImage,
    pickImage,
    uploadToS3,
  } = useS3ImageUpload();

  useEffect(() => {
    if (backendUser) {
      setFormData({
        firstName: backendUser.firstName || "",
        lastName: backendUser.lastName || "",
        email: backendUser.email || "",
        phone: backendUser.phone || "",
      });
    } else if (auth0User) {
      const nameParts = auth0User.name?.split(" ") || ["", ""];
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: auth0User.email || "",
        phone: "",
      });
    }
  }, [auth0User, backendUser]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      let profilePictureUrl =
        backendUser?.profilePictureUrl || auth0User?.picture;

      if (image) {
        const uploadResult = await uploadToS3();
        if (uploadResult?.success && uploadResult.url) {
          profilePictureUrl = uploadResult.url;
        }
      }

      const credentials = await getCredentials();

      if (!credentials?.accessToken) {
        throw new Error("Authentication credentials are missing");
      }

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        profilePictureUrl: profilePictureUrl || null,
      };

      console.log("Updating user profile with data:", updateData);

      const response = await fetch(
        `https://${apiUrl}/users/${backendUser?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          body: JSON.stringify(updateData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", response.status, errorData);
        throw new Error(
          `API error: ${response.status} - ${errorData.message || response.statusText}`,
        );
      }

      const updatedUser = await response.json();
      console.log("Profile updated successfully:", updatedUser);

      refetch();

      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setApiError(error.message || "Failed to update profile");
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please Try Again",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </View>
    );
  }

  if (error && !backendUser && !auth0User) {
    return (
      <View className="flex-1 justify-center items-center">
        <ThemedText className="text-center mb-4">
          Error loading profile: {error.message}
        </ThemedText>
        <Button onPress={() => router.back()}>
          <ButtonText>Go Back</ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
        >
          <ScrollView className="bg-primary-50">
            <HStack className="items-center px-4 py-2">
              <BackButton />
            </HStack>

            {/* Profile Picture */}
            <View className="items-center my-6">
              <Avatar size="xl" className="mb-2">
                {image?.uri ||
                backendUser?.profilePictureUrl ||
                auth0User?.picture ? (
                  <AvatarImage
                    source={{
                      uri:
                        image?.uri ||
                        backendUser?.profilePictureUrl ||
                        auth0User?.picture,
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
                disabled={uploadingImage}
              >
                <HStack className="items-center">
                  <IconSymbol name="photo" size={16} color={"#0891b2"} />
                  <ButtonText className="ml-1">
                    {uploadingImage ? "Uploading..." : "Change Photo"}
                  </ButtonText>
                </HStack>
              </Button>
            </View>

            {apiError && (
              <ThemedText className="text-red-500 text-center mb-4">
                {apiError}
              </ThemedText>
            )}

            <VStack space="lg" className="mb-6 px-4">
              <VStack>
                <ThemedText>First Name</ThemedText>
                <Input>
                  <InputField
                    className="bg-white"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChangeText={(value) => handleChange("firstName", value)}
                  />
                </Input>
                {errors.firstName && (
                  <ThemedText className="text-red-500">
                    {errors.firstName}
                  </ThemedText>
                )}
              </VStack>
            </VStack>

            <VStack space="lg" className="mb-6 px-4">
              <VStack>
                <ThemedText>Last Name</ThemedText>
                <Input>
                  <InputField
                    className="bg-white"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChangeText={(value) => handleChange("lastName", value)}
                  />
                </Input>
                {errors.lastName && (
                  <ThemedText className="text-red-500">
                    {errors.lastName}
                  </ThemedText>
                )}
              </VStack>
            </VStack>

            <VStack space="lg" className="mb-6 px-4">
              <VStack>
                <ThemedText>Email</ThemedText>
                <Input>
                  <InputField
                    className="bg-white"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => handleChange("email", value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
                {errors.email && (
                  <ThemedText className="text-red-500">
                    {errors.email}
                  </ThemedText>
                )}
              </VStack>
            </VStack>

            <VStack space="lg" className="mb-6 px-4">
              <VStack>
                <ThemedText>Phone (Optional)</ThemedText>
                <Input>
                  <InputField
                    className="bg-white"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChangeText={(value) => handleChange("phone", value)}
                    keyboardType="phone-pad"
                  />
                </Input>
                {errors.phone && (
                  <ThemedText className="text-red-500">
                    {errors.phone}
                  </ThemedText>
                )}
              </VStack>
            </VStack>

            <VStack className="mb-12 px-4">
              <Button
                variant="solid"
                isDisabled={isSubmitting || uploadingImage}
                onPress={handleSubmit}
                className="mt-4 rounded-lg"
              >
                {isSubmitting || uploadingImage ? (
                  <HStack className="items-center justify-center">
                    <Spinner size="small" color="white" />
                    <ButtonText className="ml-2">Saving...</ButtonText>
                  </HStack>
                ) : (
                  <ButtonText>Save Changes</ButtonText>
                )}
              </Button>
            </VStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default EditProfileScreen;
