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
import dynamic from "next/dynamic";
import { useSidebarState } from "@/hooks/useSidebarToggle";
import { cn } from "@/lib/utils";

export default function SpaceIdPage() {
  const { spaceId, noteId } = useParams<{
    spaceId?: string;
    noteId?: string;
  }>();
  const context = useContext(SpacesContext);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const BlockNote = useMemo(
    () =>
      dynamic(() => import("@/components/Editor/BlockNote"), {
        ssr: false,
      }),
    []
  );
  const isSidebarOpen = useSidebarState((state) => state.isOpen);

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
  const saveNoteContent = (newContent: string) => {
    if (spaceId && noteId) {
      context?.saveNoteContent(spaceId, noteId, newContent);
    }
  };
  return (
    <div
      className={cn(
        "w-auto min-h-full max-w-[960px] flex-col justify-center",
        "mb-48 mx-auto"
      )}
    >
      <NoteTitle note={note} />
      <BlockNote content={note.content} setContent={saveNoteContent} />
    </div>
  );
}
