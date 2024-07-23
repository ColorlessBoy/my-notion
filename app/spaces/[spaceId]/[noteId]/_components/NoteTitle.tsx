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
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [value, setValue] = useState(note.title);
  const [oldTitle, setOldTitle] = useState("");
  const handleDoubleClick = () => {
    setIsEditing(true);
    setOldTitle(value || "");
  };
  const updateTitle = (newTitle: string) => {
    if (context && spaceId && noteId && note) {
      if (note.title !== newTitle) {
        context.updateNoteTitle(spaceId, noteId, newTitle);
        context.updateTocTitle(spaceId, noteId, newTitle);
        setValue(newTitle);
      }
    }
  };
  const saveTitle = async () => {
    if (context && spaceId && noteId && oldTitle !== note.title) {
      setIsEditing(false);
      setIsSaving(true);
      await context.saveNote(spaceId, noteId);
      await context.saveToc2(spaceId);
      setIsSaving(false);
      setOldTitle("");
    }
  };
  const handleBlur = () => {
    saveTitle();
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setIsEditing(false);
      saveTitle();
      setOldTitle("");
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsEditing(false);
      updateTitle(oldTitle);
      setOldTitle("");
    }
  };

  return (
    <div className="flex w-full items-center">
      {isEditing ? (
        <input
          className="text-3xl font-bold"
          value={value || ""}
          onChange={(e) => updateTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <div className="text-3xl font-bold" onDoubleClick={handleDoubleClick}>
          {note.title || "无标题"}
        </div>
      )}{" "}
      {isSaving && <Loader2 className="ml-2 w-7 h-7 animate-spin" />}
    </div>
  );
}
