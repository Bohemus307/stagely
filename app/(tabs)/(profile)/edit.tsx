import React from "react";
import { SafeAreaView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import BackButton from "@/components/BackButton";
import { ThemedText } from "@/components/ThemedText";

const EditProfile = () => {
  return (
    <ThemedView className="flex-1">
      <BackButton />
      <SafeAreaView className="flex-1">
        <ThemedText>EDIT PROFILE COMING SOON!</ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
};

export default EditProfile;
