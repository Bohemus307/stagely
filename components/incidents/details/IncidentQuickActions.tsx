import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Incident } from "@/lib/@types/properties";
import { Colors } from "@/constants/Colors";

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
          className="mb-1 bg-primary-500 rounded-lg shadow-sm"
          onPress={onEscalate}
        >
          <HStack className="justify-center items-center">
            <IconSymbol
              name="exclamationmark.triangle"
              size={18}
              color={"white"}
            />
            <ButtonText className="ml-2 text-white">
              Escalate Incident
            </ButtonText>
          </HStack>
        </Button>

        <Button
          className="mb-1 bg-primary-500 rounded-lg shadow-sm"
          onPress={onContactManager}
        >
          <HStack className="justify-center items-center">
            <IconSymbol name="message" size={18} color={"white"} />
            <ButtonText className="ml-2 text-white">
              Contact Property Manager
            </ButtonText>
          </HStack>
        </Button>

        <Button
          className="mb-1 bg-primary-500 rounded-lg shadow-sm"
          onPress={onGenerateReport}
        >
          <HStack className="justify-center items-center shadow-sm">
            <IconSymbol name="message" size={18} color={"white"} />
            <ButtonText className="ml-2 text-white">Generate Report</ButtonText>
          </HStack>
        </Button>

        <Button
          className="mb-1 bg-primary-500 rounded-lg shadow-sm"
          onPress={onEditIncident}
        >
          <HStack className="justify-center items-center">
            <IconSymbol name="pencil" size={18} color={"white"} />
            <ButtonText className="ml-2 text-white">Edit Incident</ButtonText>
          </HStack>
        </Button>
      </VStack>
    </Box>
  );
};

export default IncidentActions;
