import React, { useState } from "react";
import { formatDate } from "@/components/message/lib/utils/timeHelpers";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ThemedText } from "@/components/ThemedText";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";

interface Note {
  text: string;
  timestamp: string;
}

interface IncidentNoteProps {
  initialNotes: Note[];
  onAddNote: (note: Note) => void;
}
const IncidentNotes: React.FC<IncidentNoteProps> = ({
  initialNotes,
  onAddNote,
}) => {
  const [newNote, setNewNote] = useState<string>("");
  const [notes, setNotes] = useState<{ text: string; timestamp: string }[]>([]);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const newNoteObj: Note = {
      text: newNote,
      timestamp: new Date().toISOString(),
    };

    setNotes([...notes, newNoteObj]);
    onAddNote(newNoteObj);
    setNewNote("");
    setShowNoteEditor(false);
  };

  return (
    <Box className="bg-white mx-4 p-4 rounded-lg shadow-sm mb-4">
      <HStack className="justify-between items-center mb-3">
        <ThemedText type="defaultSemiBold">Notes & Updates</ThemedText>
        <Button
          size="sm"
          variant="outline"
          className="bg-primary-500 py-2 rounded-md"
          onPress={() => setShowNoteEditor(!showNoteEditor)}
        >
          <ButtonText className="text-white">
            {showNoteEditor ? "Cancel" : "Add Note"}
          </ButtonText>
        </Button>
      </HStack>

      {showNoteEditor && (
        <VStack className="space-y-4 mb-4">
          <Textarea size="md" className="bg-white">
            <TextareaInput
              placeholder="Enter notes about the incident..."
              value={newNote}
              onChangeText={setNewNote}
            />
          </Textarea>

          <Button onPress={handleAddNote}>
            <ButtonText>Save</ButtonText>
          </Button>
        </VStack>
      )}

      {notes.length > 0 ? (
        <VStack className="space-y-3">
          {notes.map((note, index) => (
            <Box key={index} className="p-3 bg-gray-50 rounded-lg">
              <ThemedText>{note.text}</ThemedText>
              <ThemedText>{formatDate(note.timestamp)}</ThemedText>
            </Box>
          ))}
        </VStack>
      ) : (
        <ThemedText>No notes have been added yet.</ThemedText>
      )}
    </Box>
  );
};

export default IncidentNotes;
