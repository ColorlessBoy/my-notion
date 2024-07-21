"use client";
import * as db from "@/db";
import { Space } from "@prisma/client";
import { useRouter, useParams } from "next/navigation";
import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  useTransition,
} from "react";

function log(name: string, obj?: any) {
  console.log(`[providers][space][${name}]`, obj);
}

// 定义上下文的数据结构
interface SpacesContextType {
  spaces: Space[];
  isLoading: boolean;

  createSpace: (title?: string, content?: string) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  saveSpace: (space: Space) => Promise<void>;
  updateSpace: (
    space: Space,
    title?: string,
    content?: string,
    isDeleted?: boolean
  ) => Space;

  /*
  notesMap: Record<string, Note[]>;

  tocMap: Record<string, TreeItem[]>;
  fetchToc: (spaceId: string) => Promise<TreeItem[]>;
  getToc: (spaceId: string) => TreeItem[];
  setToc: (spaceId: string, newTreeItems: TreeItem[]) => void;
  tocCreateNewChild: (spaceId: string, noteId?: string) => Promise<void>;
  tocUpdateTitle: (spaceId: string, noteId: string, newTitle: string) => void;
  */
}

export const SpacesContext = createContext<SpacesContextType | undefined>(
  undefined
);

interface SpacesProviderProps {
  userId: string;
  children: ReactNode;
}

export const SpacesProvider = ({ userId, children }: SpacesProviderProps) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  // const [tocMap, setTocMap] = useState<Record<string, TreeItem[]>>({});
  // const [notesMap, setNotesMap] = useState<Record<string, Note[]>>({});

  const [isLoading, load] = useTransition();
  // 初始化
  useEffect(() => {
    load(async () => {
      await db.space.$getAll(userId).then((spaces) => {
        setSpaces(spaces);
      });
    });
  }, [userId]);

  const createSpace = async (title?: string, content?: string) => {
    log("createSpace", { userId, title, content });
    await db.space.$create(userId, title, content).then((space) => {
      if (space) {
        setSpaces([...spaces, space]);
      }
    });
  };

  const deleteSpace = async (id: string) => {
    log("deleteSpace", { id });
    const index = spaces.findIndex((space) => space.id === id);
    if (index === -1) {
      return;
    }
    const deleteSpaceId = spaces.at(index)?.id;
    if (deleteSpaceId === undefined) {
      return;
    }
    const newSpaces = [...spaces];
    newSpaces.splice(index, 1);
    setSpaces(newSpaces);
    await db.space.$delete(deleteSpaceId);
  };

  const saveSpace = async (space: Space) => {
    log("saveSpace", { space });
    await db.space.$update(
      space.id,
      space.title,
      space.content,
      space.isDeleted
    );
  };
  const updateSpace = (
    space: Space,
    title?: string,
    content?: string,
    isDeleted?: boolean
  ) => {
    log("updateSpace", { space, title, content, isDeleted });
    if (
      title === undefined &&
      content === undefined &&
      isDeleted === undefined
    ) {
      return space;
    }
    const newSpaces = [...spaces];
    const index = spaces.findIndex((s) => s.id === space.id);
    if (index === -1) {
      return space;
    }
    newSpaces[index] = { ...spaces[index] };
    if (title !== undefined) {
      newSpaces[index].title = title;
    }
    if (content !== undefined) {
      newSpaces[index].content = content;
    }
    if (isDeleted !== undefined) {
      newSpaces[index].isDeleted = isDeleted;
    }
    setSpaces(newSpaces);
    return newSpaces[index];
  };

  /*
  const createNote = async (spaceId: string) => {
    log("createNote", spaceId);
    const note = await db.note.$create(spaceId);
    if (note !== null) {
      let noteList = notesMap[spaceId];
      if (!noteList) {
        noteList = [note];
      } else {
        noteList = [...noteList, note];
      }
      setNotesMap({ ...notesMap, [spaceId]: noteList });
    }
    return note;
  };
  const updateNoteTitle = (
    spaceId: string,
    noteId: string,
    newTitle: string
  ) => {
    log("updateNoteTitle", spaceId);
    const noteList = notesMap[spaceId];
    if (noteList) {
      const index = noteList.findIndex((note) => note.id === noteId);
      if (index !== -1) {
        const newNoteList = [...noteList];
        newNoteList[index] = { ...noteList[index], title: newTitle };
        setNotesMap({ ...notesMap, [spaceId]: newNoteList });
        db.note.$update(noteId, newTitle);
      }
    }
  };
  const fetchToc = async (spaceId: string) => {
    log("fetchToc", spaceId);
    const result = tocMap[spaceId];
    if (!result) {
      const toc = await db.tableOfContent.$getLatest(spaceId);
      if (toc !== null && toc.content !== null) {
        const newItems = JSON.parse(toc.content) as TreeItem[];
        const newTocMap = { ...tocMap, [spaceId]: newItems };
        setTocMap(newTocMap);
        return newItems;
      }
    }
    return result;
  };

  const getToc = (spaceId: string) => {
    log("getToc", spaceId);
    return tocMap[spaceId] || [];
  };

  const setToc = (spaceId: string, newItems: TreeItem[]) => {
    log("setToc", spaceId);
    const newTocMap = { ...tocMap, [spaceId]: newItems };
    setTocMap(newTocMap);
    // 总是设置新的toc，定时清除
    db.tableOfContent.$create(spaceId, JSON.stringify(newItems));
  };

  const tocCreateNewChild = async (spaceId: string, noteId?: string) => {
    log("tocCreateNewChild", spaceId);
    const newNote = await createNote(spaceId);
    const newItem = newNote
      ? {
          id: newNote.id,
          title: newNote.title || "",
          children: [] as TreeItem[],
          collapsed: false,
        }
      : undefined;
    const toc = getToc(spaceId);
    const newToc = createNewChild(toc, noteId, newItem);
    const newTocMap = { ...tocMap, [spaceId]: newToc };
    setTocMap(newTocMap);
  };

  const tocUpdateTitle = (spaceId: string, noteId: string, title: string) => {
    log("tocCreateNewChild", spaceId);
    const toc = getToc(spaceId);
    const newToc = [...toc];
    setProperty(newToc, noteId, "title", (_) => {
      return title;
    });
    updateNoteTitle(spaceId, noteId, title);
    setToc(spaceId, newToc);
  };
  */

  return (
    <SpacesContext.Provider
      value={{
        spaces,
        isLoading,
        createSpace,
        deleteSpace,
        saveSpace,
        updateSpace,
      }}
    >
      {children}
    </SpacesContext.Provider>
  );
};
