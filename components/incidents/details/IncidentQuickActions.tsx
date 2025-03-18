import React from "react";
import { Incident } from "../data/incidents";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";

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
    <Box className="bg-white mx-4 p-4 rounded-lg shadow-sm mb-4">
      <VStack className="space-y-3 bg-primary-50">
        <Button variant="outline" onPress={onEscalate}>
          <HStack className="justify-center items-center">
            <IconSymbol
              name="exclamationmark.triangle"
              size={18}
              color={"ef4444"}
            />
            <ButtonText className="text-red-500 ml-2">
              Escalate Incident
            </ButtonText>
          </HStack>
        </Button>

        <Button variant="outline" onPress={onContactManager}>
          <HStack className="justify-center items-center">
            <IconSymbol name="message" size={18} color={"#6b7280"} />
            <ButtonText className="ml-2">Contact Property Manager</ButtonText>
          </HStack>
        </Button>

        <Button variant="outline" onPress={onGenerateReport}>
          <HStack className="justify-center items-center">
            <IconSymbol name="message" size={18} color={"#6b7280"} />
            <ButtonText className="ml-2">Generate Report</ButtonText>
          </HStack>
        </Button>

        <Button variant="outline" onPress={onEditIncident}>
          <HStack className="justify-center items-center">
            <IconSymbol name="pencil" size={18} color={"#6b7280"} />
            <ButtonText className="ml-2">Edit Incident</ButtonText>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
};

export default IncidentActions;
