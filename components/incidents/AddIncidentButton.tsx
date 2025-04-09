import { Button, ButtonText } from "@/components/ui/button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { VStack } from "@/components/ui/vstack";
import PropertyConfirmationModal from "@/components/PropertyConfirmationModal";
import PropertySelectionModal from "@/components/PropertySelectionModal";
import { useIncidentCreation } from "@/hooks/incidents/useIncidentCreation";

export default function AddIncidentButton() {
  const {
    nearestProperty,
    isLoading,
    isProcessing,
    showModal,
    setShowModal,
    showPropertySelectionModal,
    setShowPropertySelectionModal,
    streetViewError,
    setStreetViewError,
    handleCreateIncident,
    handleConfirmProperty,
    handleViewAllProperties,
    handleSelectProperty,
  } = useIncidentCreation();

  return (
    <>
      <Button
        className="h-16 w-1/2 rounded-lg flex flex-col items-center justify-center shadow-sm bg-background-50"
        onPress={handleCreateIncident}
        isDisabled={isLoading || isProcessing}
      >
        <VStack className="items-center justify-center">
          <IconSymbol
            size={18}
            name="exclamationmark.triangle.fill"
            color="grey"
          />
          <ButtonText className="text-primary-500 mt-1">
            {isLoading || isProcessing ? "Locating..." : "New Incident"}
          </ButtonText>
        </VStack>
      </Button>

      <PropertyConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        property={nearestProperty}
        onConfirm={handleConfirmProperty}
        onViewAll={handleViewAllProperties}
        streetViewError={streetViewError}
        setStreetViewError={setStreetViewError}
      />

      <PropertySelectionModal
        isOpen={showPropertySelectionModal}
        onClose={() => setShowPropertySelectionModal(false)}
        onSelectProperty={handleSelectProperty}
      />
    </>
  );
}
