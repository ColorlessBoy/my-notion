import { SpacesContext } from "@/components/providers/SpacesProvider";
import { Note } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { KeyboardEventHandler, useContext, useState } from "react";

export default function NoteTitle({ note }: { note: Note }) {
  const { spaceId, noteId } = useParams<{
    spaceId?: string;
    noteId?: string;
  }>();
  const context = useContext(SpacesContext);
  const [hasChanged, setHasChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  const updateTitle = (newTitle: string) => {
    if (context && spaceId && noteId && note) {
      if (note.title !== newTitle) {
        context.updateNoteTitle(spaceId, noteId, newTitle);
        context.updateTocTitle(spaceId, noteId, newTitle);
        setHasChanged(true);
      }
    }
  };
  const saveTitle = async () => {
    if (context && spaceId && noteId && hasChanged) {
      setIsSaving(true);
      await context.saveNote(spaceId, noteId);
      await context.saveToc2(spaceId);
      setIsSaving(false);
      setHasChanged(false);
    }
  };
  const handleBlur = () => {
    setIsEditing(false);
    saveTitle();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setIsEditing(false);
      saveTitle();
    }
  };

  return (
    <div className="flex w-full">
      {isEditing ? (
        <input
          className="text-lg font-bold"
          value={note.title || ""}
          onChange={(e) => updateTitle(e.currentTarget.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        ></input>
      ) : (
        <div className="text-lg font-bold" onDoubleClick={handleDoubleClick}>
          {note.title || "无标题"}
        </div>
      )}{" "}
      {isSaving && <Loader2 className="p-2 animate-spin" />}
    </div>
  );
}
