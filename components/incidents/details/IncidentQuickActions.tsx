import React from "react";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Incident } from "@/lib/@types/properties";

interface IncidentActionProps {
  incident: Incident;
  onEscalate?: () => void;
  onContactManager?: () => void;
  onGenerateReport?: () => void;
  onEditIncident?: () => void;
}

const IncidentActions: React.FC<IncidentActionProps> = ({
  incident,
  onEscalate,
  onContactManager,
  onGenerateReport,
  onEditIncident,
}) => {
  return (
    <Box className="bg-primary-50 mx-4 p-4 rounded-lg shadow-sm mb-4">
      <VStack className="">
        <Button
          className="mb-1 bg-white rounded-lg shadow-sm"
          variant="outline"
          onPress={onEscalate}
        >
          <HStack className="justify-center items-center">
            <IconSymbol
              name="exclamationmark.triangle"
              size={18}
              color={"blue"}
            />
            <ButtonText className="ml-2">Escalate Incident</ButtonText>
          </HStack>
        </Button>

        <Button
          className="mb-1 bg-white rounded-lg shadow-sm"
          variant="outline"
          onPress={onContactManager}
        >
          <HStack className="justify-center items-center">
            <IconSymbol name="message" size={18} color={"blue"} />
            <ButtonText className="ml-2">Contact Property Manager</ButtonText>
          </HStack>
        </Button>

        <Button
          className="mb-1 bg-white rounded-lg shadow-sm"
          variant="outline"
          onPress={onGenerateReport}
        >
          <HStack className="justify-center items-center shadow-sm">
            <IconSymbol name="message" size={18} color={"blue"} />
            <ButtonText className="ml-2">Generate Report</ButtonText>
          </HStack>
        </Button>

        <Button
          className="mb-1 bg-white rounded-lg shadow-sm"
          variant="outline"
          onPress={onEditIncident}
        >
          <HStack className="justify-center items-center">
            <IconSymbol name="pencil" size={18} color={"blue"} />
            <ButtonText className="ml-2">Edit Incident</ButtonText>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
};

export default IncidentActions;
