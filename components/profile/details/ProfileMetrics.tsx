import React, { useMemo } from "react";
import { ThemedText } from "@/components/ThemedText";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";

interface ProfileMetricsProps {
  propertiesCount: number;
  teamMembersCount: number;
  activeTasksCount: number;
}

const ProfileMetrics: React.FC<ProfileMetricsProps> = ({
  propertiesCount,
  teamMembersCount,
  activeTasksCount,
}) => {
  const metrics = useMemo(() => {
    return [
      { title: "Properties", value: propertiesCount },
      { title: "Team", value: teamMembersCount },
      { title: "Tasks", value: activeTasksCount },
    ];
  }, [propertiesCount, teamMembersCount, activeTasksCount]);

  return (
    <Box className="p-2 rounded-2xl flex flex-col items-center justify-center mr-4 mt-2 mb-0">
      <HStack className="justify-between px-2 w-full gap-2">
        {metrics.map((item, index) => (
          <Box
            key={index}
            className="h-16 w-1/3 p-2 rounded-lg flex flex-col justify-center shadow-sm bg-white"
          >
            <ThemedText className="text-left text-black font-semibold font-roboto mb-1">
              {item.title}
            </ThemedText>
            <ThemedText className="text-2xl font-semibold font-roboto text-left">
              {item.value}
            </ThemedText>
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

export default ProfileMetrics;
