"use client";

import { SpacesContext } from "@/components/providers/SpacesProvider";
import { Note } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import {
  KeyboardEventHandler,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import NoteTitle from "./_components/NoteTitle";

export default function SpaceIdPage() {
  const { spaceId, noteId } = useParams<{
    spaceId?: string;
    noteId?: string;
  }>();
  const context = useContext(SpacesContext);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  useEffect(() => {
    if (context && spaceId && noteId) {
      setIsLoading(true);
      context.fetchNote(spaceId, noteId).then((note) => {
        setNote(note);
      });
      setIsLoading(false);
    }
  }, [context?.notesMap]);

  if (isLoading) {
    return <Loader2 className="w-10 h-10 animate-spin" />;
  }
  if (!note) {
    return <div className="text-lg font-bold">笔记没有找到，或许已删除？</div>;
  }
  return (
    <div className="w-full min-h-full">
      <NoteTitle note={note} />
    </div>
  );
}
