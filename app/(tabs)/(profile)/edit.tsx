import React, { useEffect, useState, useMemo } from "react";
import { ScrollView, View } from "react-native";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { Spinner } from "@/components/ui/spinner";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { useUpdateUser } from "@/hooks/profile/useUpdateUser";
import { UpdateUserData } from "@/hooks/profile/useUpdateUser";
import { ThemedView } from "@/components/ThemedView";
import { Box } from "@/components/ui/box";
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Pressable } from "@/components/ui/pressable";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { VStack } from "@/components/ui/vstack";
import { Colors } from "@/constants/Colors";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { useAuthUser } from "@/hooks/useAuthUser";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

const EditProfileScreen = () => {
  const {
    backendUser: user,
    isLoading: userLoading,
    error: userError,
    refetch,
  } = useAuthUser();

  const userId = user?.id ? user.id.toString() : undefined;

  const {
    updateUser,
    isPending: isUpdating,
    isSuccess,
    isError,
    error: updateError,
  } = useUpdateUser(userId);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess) {
      setShowEditModal(false);

      refetch();
    }
  }, [isSuccess, refetch]);

  const profileImageUrl = useMemo(() => {
    const getCloudFrontUrl = (s3Url: string): string | null => {
      if (!s3Url) return null;
      const s3Key = s3Url.split("amazonaws.com/")[1];
      if (!s3Key) return s3Url;
      return `https://d24y6hzot6c372.cloudfront.net/${s3Key}`;
    };

    if (user?.profilePictureUrl) {
      try {
        const decodedUrl = decodeURI(user.profilePictureUrl);
        return getCloudFrontUrl(decodedUrl);
      } catch (error) {
        console.warn("Error processing profile image URL:", error);
        return null;
      }
    }
    return null;
  }, [user?.profilePictureUrl]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email format is invalid";
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = "Phone number format is invalid";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const updatedData: UpdateUserData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
    };

    if (formData.phone.trim()) {
      updatedData.phone = formData.phone.trim();
    }

    updateUser(updatedData);
  };

  const handlePhotoFromCamera = async () => {
    setShowPhotoModal(false);
  };

  const handlePhotoFromGallery = async () => {
    setShowPhotoModal(false);
    router.push("/(tabs)/(profile)/select");
  };

  if (userLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size={"large"} />
      </View>
    );
  }

  if (userError || !user) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-4">
        <BackButton />
        <ThemedText>
          {userError ? `Error: ${userError.message}` : "User not found"}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Box className="p-5 pb-0">
        <BackButton />
      </Box>

      <Box className="p-5 pt-2">
        {(isError || updateError) && (
          <Box className="bg-red-100 p-4 rounded-lg mb-6">
            <ThemedText className="text-red-800">
              {updateError?.message ||
                "An error occurred while updating your profile"}
            </ThemedText>
          </Box>
        )}

        {/* Profile Picture Display */}
        <Box className="items-center mb-8">
          <Avatar size="2xl" className="mb-4">
            {profileImageUrl ? (
              <AvatarImage source={{ uri: profileImageUrl }} />
            ) : (
              <AvatarFallbackText>
                {(user.firstName || "").charAt(0)}
                {(user.lastName || "").charAt(0)}
              </AvatarFallbackText>
            )}
          </Avatar>

          <ThemedText type="defaultSemiBold" className="text-lg mb-1">
            {user.firstName} {user.lastName}
          </ThemedText>
          <ThemedText className="text-gray-600">{user.email}</ThemedText>
        </Box>

        {/* Change Photo Card */}
        <Pressable
          onPress={() => setShowPhotoModal(true)}
          className="bg-primary-100 rounded-2xl p-5 mb-5"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <HStack className="items-center mb-3">
            <Box className="w-10 h-10 bg-primary-700 rounded-xl items-center justify-center mr-4">
              <IconSymbol name="photo" size={20} color="white" />
            </Box>
            <VStack className="flex-1">
              <ThemedText type="defaultSemiBold">
                Change Profile Photo
              </ThemedText>
              <ThemedText className="text-gray-600 text-sm">
                Update your profile picture
              </ThemedText>
            </VStack>
            <IconSymbol
              name="chevron.right"
              size={16}
              color={Colors.light.icon}
            />
          </HStack>
        </Pressable>

        {/* Edit Details Card */}
        <Pressable
          onPress={() => setShowEditModal(true)}
          className="bg-primary-100 rounded-2xl p-5 mb-8"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          disabled={isUpdating}
        >
          <HStack className="items-center mb-3">
            <Box className="w-10 h-10 bg-primary-700 rounded-xl items-center justify-center mr-4">
              {isUpdating ? (
                <Spinner size="small" color="white" />
              ) : (
                <IconSymbol name="pencil" size={20} color="white" />
              )}
            </Box>
            <VStack className="flex-1">
              <ThemedText type="defaultSemiBold">
                Edit Profile Details
              </ThemedText>
              <ThemedText className="text-gray-600 text-sm">
                Update name and phone number
              </ThemedText>
            </VStack>
            {!isUpdating && (
              <IconSymbol
                name="chevron.right"
                size={16}
                color={Colors.light.icon}
              />
            )}
          </HStack>
        </Pressable>
      </Box>

      {/* Photo Modal */}
      <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)}>
        <ModalBackdrop />
        <ModalContent className="m-4">
          <ModalHeader>
            <Heading size="lg">Change Profile Photo</Heading>
            <ModalCloseButton>
              <IconSymbol name="xmark" size={16} color={Colors.light.icon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              <Pressable
                onPress={handlePhotoFromCamera}
                className="bg-gray-200 rounded-xl overflow-hidden"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f8fafc" : "white",
                })}
              >
                <HStack className="flex-row items-center py-5 px-4">
                  <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                    <IconSymbol name="camera.fill" size={24} color="white" />
                  </Box>
                  <VStack>
                    <ThemedText type="defaultSemiBold">Take Photo</ThemedText>
                  </VStack>
                </HStack>
              </Pressable>

              <Pressable
                onPress={handlePhotoFromGallery}
                className="bg-gray-200 rounded-xl overflow-hidden"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f8fafc" : "white",
                })}
              >
                <HStack className="flex-row items-center py-5 px-4">
                  <Box className="w-12 h-12 bg-primary-500 rounded-full justify-center items-center mr-4">
                    <IconSymbol
                      name="photo.on.rectangle"
                      size={24}
                      color="white"
                    />
                  </Box>
                  <VStack>
                    <ThemedText type="defaultSemiBold">
                      Upload from Gallery
                    </ThemedText>
                  </VStack>
                </HStack>
              </Pressable>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onPress={() => setShowPhotoModal(false)}
              className="flex-1"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Details Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <ModalBackdrop />
        <ModalContent className="m-4">
          <ModalHeader>
            <Heading size="lg">Edit Profile</Heading>
            <ModalCloseButton>
              <IconSymbol name="xmark" size={16} color={Colors.light.icon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <VStack space="md">
              {/* First Name */}
              <Box>
                <ThemedText className="font-semibold mb-2">
                  First Name
                </ThemedText>
                <Input className="bg-white rounded-lg">
                  <InputField
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChangeText={(value) => handleChange("firstName", value)}
                  />
                </Input>
                {validationErrors.firstName && (
                  <ThemedText className="text-red-500 text-sm mt-1">
                    {validationErrors.firstName}
                  </ThemedText>
                )}
              </Box>

              {/* Last Name */}
              <Box>
                <ThemedText className="font-semibold mb-2">
                  Last Name
                </ThemedText>
                <Input className="bg-white rounded-lg">
                  <InputField
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChangeText={(value) => handleChange("lastName", value)}
                  />
                </Input>
                {validationErrors.lastName && (
                  <ThemedText className="text-red-500 text-sm mt-1">
                    {validationErrors.lastName}
                  </ThemedText>
                )}
              </Box>

              {/* Email */}
              <Box>
                <ThemedText className="font-semibold mb-2">Email</ThemedText>
                <Input className="bg-white rounded-lg">
                  <InputField
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(value) => handleChange("email", value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
                {validationErrors.email && (
                  <ThemedText className="text-red-500 text-sm mt-1">
                    {validationErrors.email}
                  </ThemedText>
                )}
              </Box>

              {/* Phone */}
              <Box>
                <ThemedText className="font-semibold mb-2">
                  Phone (Optional)
                </ThemedText>
                <Input className="bg-white rounded-lg">
                  <InputField
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChangeText={(value) => handleChange("phone", value)}
                    keyboardType="phone-pad"
                  />
                </Input>
                <ThemedText className="text-gray-500 text-xs mt-1">
                  Used for account recovery
                </ThemedText>
                {validationErrors.phone && (
                  <ThemedText className="text-red-500 text-sm mt-1">
                    {validationErrors.phone}
                  </ThemedText>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack space="md" className="flex-1">
              <Button
                variant="outline"
                onPress={() => setShowEditModal(false)}
                className="flex-1"
                disabled={isUpdating}
              >
                <ButtonText>Cancel</ButtonText>
              </Button>
              <Button
                onPress={handleSubmit}
                className="flex-1"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <ButtonText>Save</ButtonText>
                )}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ScrollView>
  );
};

export default EditProfileScreen;
