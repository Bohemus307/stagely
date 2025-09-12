import React from "react";
import { Box } from "@/components/ui/box";
import { ThemedText } from "@/components/ThemedText";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface Step {
  number: number;
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  variant?: "default" | "compact" | "detailed";
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  variant = "default",
}) => {
  const isStepCompleted = (stepNumber: number) => {
    return stepNumber < currentStep || completedSteps.includes(stepNumber);
  };

  const isStepActive = (stepNumber: number) => {
    return stepNumber === currentStep;
  };

  const getStepColor = (stepNumber: number) => {
    if (isStepActive(stepNumber)) return "bg-primary-500";
    if (isStepCompleted(stepNumber)) return "bg-green-500";
    return "bg-gray-300";
  };

  const getTextColor = (stepNumber: number) => {
    if (isStepActive(stepNumber)) return "text-primary-600";
    if (isStepCompleted(stepNumber)) return "text-green-600";
    return "text-gray-500";
  };

  if (variant === "compact") {
    return (
      <HStack className="justify-center items-center py-2 px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <Box
              className={`w-2 h-2 rounded-full ${getStepColor(step.number)}`}
            />
            {index < steps.length - 1 && (
              <Box
                className={`flex-1 h-0.5 mx-2 ${
                  isStepCompleted(step.number) ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </HStack>
    );
  }

  if (variant === "detailed") {
    return (
      <VStack className="py-4 px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <HStack className="items-start">
              <Box className="items-center">
                <Box
                  className={`w-12 h-12 rounded-full justify-center items-center ${getStepColor(step.number)}`}
                >
                  {isStepCompleted(step.number) ? (
                    <IconSymbol name="checkmark" size={24} color="white" />
                  ) : (
                    <ThemedText
                      className={`font-bold text-lg ${
                        isStepActive(step.number)
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {step.number}
                    </ThemedText>
                  )}
                </Box>
                {index < steps.length - 1 && (
                  <Box
                    className={`w-0.5 h-12 mt-2 ${
                      isStepCompleted(step.number)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </Box>
              <VStack className="ml-4 flex-1 pb-4">
                <ThemedText
                  className={`font-semibold ${getTextColor(step.number)}`}
                >
                  {step.label}
                </ThemedText>
                {step.description && (
                  <ThemedText className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </ThemedText>
                )}
              </VStack>
            </HStack>
          </React.Fragment>
        ))}
      </VStack>
    );
  }

  // Default variant
  return (
    <Box className="py-4 px-4 bg-gray-50">
      <HStack className="justify-between items-start">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <VStack className="items-center flex-1">
              <Box
                className={`w-10 h-10 rounded-full justify-center items-center ${getStepColor(step.number)}`}
              >
                {isStepCompleted(step.number) ? (
                  <IconSymbol name="checkmark" size={18} color="white" />
                ) : (
                  <ThemedText
                    className={`font-semibold ${
                      isStepActive(step.number) ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {step.number}
                  </ThemedText>
                )}
              </Box>
              <ThemedText
                className={`text-xs mt-1 ${
                  isStepActive(step.number)
                    ? "font-semibold"
                    : getTextColor(step.number)
                }`}
              >
                {step.label}
              </ThemedText>
            </VStack>
            {index < steps.length - 1 && (
              <Box
                className={`flex-1 h-0.5 mt-5 ${
                  isStepCompleted(step.number) ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </HStack>
    </Box>
  );
};
