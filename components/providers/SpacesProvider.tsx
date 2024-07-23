"use client";
import * as db from "@/db";
import { Note, Space } from "@prisma/client";
import {
  ReactNode,
  createContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import { TreeItem } from "../SortableTree/types";
import {
  dfsFlatten,
  flattenTree,
  setProperty,
} from "../SortableTree/utilities";
import { getCompiler } from "@/lib/compiler";
import { CompileInfo } from "@/lib/follow-parser";
import { PartialBlock } from "@blocknote/core";

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

  notesMap: Record<string, Note[]>;

  fetchNote: (spaceId: string, noteId: string) => Promise<Note | null>;

  tocMap: Record<string, TreeItem[]>;

  updateNoteTitle: (spaceId: string, noteId: string, newTitle: string) => void;
  saveNote: (spaceId: string, noteId: string) => Promise<void>;
  saveNoteContent: (
    spaceId: string,
    noteId: string,
    content: string
  ) => Promise<void>;

  createTreeItem: (spaceId: string) => Promise<TreeItem | undefined>;
  fetchToc: (spaceId: string) => Promise<TreeItem[]>;
  getToc: (spaceId: string) => TreeItem[];
  setToc: (spaceId: string, newItems: TreeItem[]) => void;
  saveToc: (spaceId: string, newItems: TreeItem[]) => Promise<void>;

  updateTocTitle: (spaceId: string, noteId: string, newTitle: string) => void;
  saveToc2: (spaceId: string) => Promise<void>;

  compile: (
    spaceId: string,
    noteId: string,
    blockIe: string,
    code: string
  ) => CompileInfo;
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
  const [tocMap, setTocMap] = useState<Record<string, TreeItem[]>>({});
  const [notesMap, setNotesMap] = useState<Record<string, Note[]>>({});

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

  const fetchNote = async (spaceId: string, noteId: string) => {
    let spaceNoteList: Note[] = [];
    if (spaceId in notesMap) {
      spaceNoteList = [...notesMap[spaceId]];
    }
    const compiler = getCompiler(spaceId);
    const note = spaceNoteList.find((n) => n.id === noteId);
    if (note) {
      if (note.content && note.content.length > 2) {
        const blocks = JSON.parse(note.content) as PartialBlock[];
        const validBlocks = blocks.filter(
          //@ts-ignore
          (block) => block.type === "follow"
          //@ts-ignore
        ) as ParitialBlock[];
        const blockIds = validBlocks.map((b) => b.id as string);
        compiler.setBlockIdList(noteId, blockIds);
        for (const block of validBlocks) {
          if (block.type === "follow") {
            compiler.compileCode(
              noteId,
              block.id,
              block.props?.data?.code || ""
            );
          }
        }
      }
      return note;
    }
    const noteFromDb = await db.note.$get(noteId);
    if (noteFromDb) {
      spaceNoteList.push(noteFromDb);
      setNotesMap({ ...notesMap, [spaceId]: spaceNoteList });
    }
    return noteFromDb;
  };

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
        if (noteList[index].title !== newTitle) {
          newNoteList[index] = { ...noteList[index], title: newTitle };
          setNotesMap({ ...notesMap, [spaceId]: newNoteList });
        }
      }
    }
  };
  const saveNoteContent = async (
    spaceId: string,
    noteId: string,
    newContent: string
  ) => {
    log("updateNoteContent", spaceId);
    const noteList = notesMap[spaceId];
    if (noteList) {
      const index = noteList.findIndex((note) => note.id === noteId);
      if (index !== -1) {
        const newNoteList = [...noteList];
        if (noteList[index].content !== newContent) {
          newNoteList[index] = { ...noteList[index], content: newContent };
          setNotesMap({ ...notesMap, [spaceId]: newNoteList });
          await db.note.$update(noteId, undefined, newContent);
        }
      }
    }
  };
  const saveNote = async (spaceId: string, noteId: string) => {
    log("saveNote", { spaceId, noteId });
    const note = await fetchNote(spaceId, noteId);
    if (note) {
      await db.note.$update(note.id, note.title, note.content);
    }
  };
  const createTreeItem = async (spaceId: string) => {
    const note = await createNote(spaceId);
    if (note) {
      const item: TreeItem = {
        id: note.id,
        title: note.title || "",
        children: [],
        collapsed: false,
      };
      return item;
    }
    return;
  };
  const fetchToc = async (spaceId: string) => {
    log("fetchToc", spaceId);
    const result = tocMap[spaceId];
    if (!result) {
      const toc = await db.tableOfContent.$getLatest(spaceId);
      if (toc !== null && toc.content !== null) {
        const newItems = JSON.parse(toc.content) as TreeItem[];
        log("fetchToc", { newItems });
        const noteIds = dfsFlatten(newItems).map((item) => item.id as string);
        const compiler = getCompiler(spaceId);
        compiler.setNoteIdList(noteIds);
        for (const noteId of noteIds) {
          await fetchNote(spaceId, noteId as string);
        }
        return newItems;
      }
    }
    log("fetchToc", { result });
    return result;
  };

  const getToc = (spaceId: string) => {
    const result = tocMap[spaceId];
    log("getToc", { spaceId, result });
    return result || [];
  };

  const setToc = (spaceId: string, newItems: TreeItem[]) => {
    log("setToc", spaceId);
    const newTocMap = { ...tocMap, [spaceId]: newItems };
    setTocMap(newTocMap);
  };
  const saveToc = async (spaceId: string, newItems: TreeItem[]) => {
    // 总是设置新的toc，定时清除
    log("saveToc", spaceId);
    await db.tableOfContent.$create(spaceId, JSON.stringify(newItems));
  };

  const updateTocTitle = async (
    spaceId: string,
    noteId: string,
    newTitle: string
  ) => {
    log("updateTocTitle", spaceId);
    const toc = getToc(spaceId);
    if (toc) {
      const newToc = setProperty(toc, noteId, "title", () => newTitle);
      setToc(spaceId, newToc);
    }
  };

  const saveToc2 = async (spaceId: string) => {
    log("saveToc2");
    const toc = getToc(spaceId);
    if (toc) {
      saveToc(spaceId, toc);
    }
  };

  const compile = (
    spaceId: string,
    noteId: string,
    blockId: string,
    code: string
  ) => {
    const rst = getCompiler(spaceId).compileCode(noteId, blockId, code);
    return rst;
  };

  return (
    <SpacesContext.Provider
      value={{
        spaces,
        isLoading,
        createSpace,
        deleteSpace,
        saveSpace,
        updateSpace,

        notesMap,
        fetchNote,

        tocMap,
        updateNoteTitle,
        saveNoteContent,
        saveNote,
        createTreeItem,
        fetchToc,
        getToc,
        setToc,
        saveToc,

        updateTocTitle,
        saveToc2,

        compile,
      }}
    >
      {children}
    </SpacesContext.Provider>
  );
};
