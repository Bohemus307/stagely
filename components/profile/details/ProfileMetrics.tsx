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
      { title: "Active Tasks", value: activeTasksCount },
    ];
  }, [propertiesCount, teamMembersCount, activeTasksCount]);

  return (
    <Box className=" p-2 rounded-2xl flex flex-col shadow-sm bg-white mt-2">
      <HStack className="justify-between px-4 w-full">
        {metrics.map((item, index) => (
          <Box
            key={index}
            className="h-18 w-[33%] rounded-lg flex flex-col bg-white"
          >
            <ThemedText className="text-left text-black font-semibold font-roboto mb-1 whitespace-nowrap overflow-hidden text-ellipsis text-sm">
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
