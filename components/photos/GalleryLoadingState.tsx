import React from "react";
import { SafeAreaView, ActivityIndicator } from "react-native";

const GalleryLoadingState: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" className="text-primary-500" />
    </SafeAreaView>
  );
};

export default GalleryLoadingState;
