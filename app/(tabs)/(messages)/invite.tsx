import React, { useState } from "react";
import { SafeAreaView, View, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { useInviteConversation } from "@/hooks/messaging/useInviteConversation";
import ResponsiveScreenWrapper from "@/components/ResponsiveScreenWrapper";

const InviteScreen = () => {
  const [email, setEmail] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const { mutate: inviteConversation, isPending: isInviting } =
    useInviteConversation();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendInvite = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert("Email Required", "Please enter an email address.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    inviteConversation(
      {
        email: trimmedEmail,
        initialMessage: initialMessage.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Invitation Sent",
            `An invitation has been sent to ${trimmedEmail}. They will receive your message once they accept the invitation.`,
            [
              {
                text: "OK",
                onPress: () => {
                  // Navigate back to main messages tab
                  router.push("/(tabs)/(messages)");
                },
              },
            ],
          );
        },
        onError: (error: Error) => {
          console.error("Failed to send invitation:", error);
          Alert.alert("Error", `Failed to send invitation: ${error.message}`);
        },
      },
    );
  };

  const canSendInvite =
    email.trim() && isValidEmail(email.trim()) && !isInviting;

  return (
    <ResponsiveScreenWrapper scrollable={false}>
      <ThemedView className="flex-1">
        <SafeAreaView className="flex-1">
          {/* Header */}
          <BackButton />
          <View className="flex-row justify-center items-center pb-2 border-b border-gray-200">
            <ThemedText
              type="defaultSemiBold"
              className="text-lg font-medium text-center flex-1"
            >
              Invite Contact
            </ThemedText>
          </View>

          {/* Content */}
          <View className="flex-1 p-4">
            <View className="gap-4">
              {/* Email Input */}
              <View>
                <ThemedText className="text-sm font-medium mb-2">
                  Email Address
                </ThemedText>
                <Input className="rounded-rxl border border-gray-400 bg-gray-100">
                  <InputField
                    className="placeholder:text-gray-700"
                    placeholder="Enter email address..."
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    editable={!isInviting}
                  />
                </Input>
              </View>

              {/* Initial Message Input */}
              <View>
                <ThemedText className="text-sm font-medium mb-2">
                  Message
                </ThemedText>
                <Input className="rounded-xl border border-gray-400 bg-gray-100 h-[100px]">
                  <InputField
                    className="placeholder:text-gray-700 p-2"
                    placeholder="Write your message..."
                    value={initialMessage}
                    onChangeText={setInitialMessage}
                    multiline
                    textAlignVertical="top"
                    editable={!isInviting}
                    style={{ minHeight: 80 }}
                  />
                </Input>
              </View>

              {/* Send Button */}
              <Button
                className={`rounded-xl mt-4 h-12 ${
                  canSendInvite ? "bg-primary-500" : "bg-gray-300"
                }`}
                onPress={handleSendInvite}
                disabled={!canSendInvite}
              >
                {isInviting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ButtonText
                    className={canSendInvite ? "text-white" : "text-gray-500"}
                  >
                    Send Invitation
                  </ButtonText>
                )}
              </Button>

              {/* Help Text */}
              <View className="mt-4 p-4 bg-blue-50 rounded-xl">
                <ThemedText className="text-sm text-blue-700">
                  The person will receive an email invitation to join the app.
                  Once they sign up, your initial message will be waiting for
                  them.
                </ThemedText>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    </ResponsiveScreenWrapper>
  );
};

export default InviteScreen;
