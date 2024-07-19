"use client";
import * as db from "@/db";
import { SPACE_URL } from "@/routes";
import { Space } from "@prisma/client";
import { useRouter, useParams } from "next/navigation";
import {
  ReactNode,
  createContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

function log(name: string, obj?: any) {
  console.log(`[providers][space][${name}]`, obj);
}

// 定义上下文的数据结构
interface SpacesContextType {
  spaces: Space[];
  isInit: boolean;
  isPending: boolean;
  createSpace: (title?: string, content?: string) => void;
  updateSpace: (id: string, title?: string, content?: string) => void;
  deleteSpace: (id: string) => void;
  moveToTrash: (id: string) => void;
  recoverFromTrash: (id: string) => void;

  choosedSpace: Space | undefined;
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
  const [isIniting, startInit] = useTransition();
  const [isPending, startTransition] = useTransition();
  const { spaceId } = useParams<{ spaceId?: string }>();
  const router = useRouter();

  const choosedSpace = useMemo(() => {
    const space = spaces.find((e) => e.id === spaceId);
    return space;
  }, [spaceId, spaces]);

  useEffect(() => {
    startInit(async () => {
      await db.space.$getAll(userId).then((spaces) => {
        setSpaces(spaces);
      });
    });
  }, [userId, spaceId]);

  const createSpace = (title?: string, content?: string) => {
    log("createSpace", { userId, title, content });
    if (isPending) {
      return;
    }
    startTransition(async () => {
      await db.space.$create(userId, title, content).then((space) => {
        if (space) {
          setSpaces([...spaces, space]);
        }
      });
    });
  };
  const deleteSpace = (id: string) => {
    log("deleteSpace", { id });
    if (isPending) {
      return;
    }
    const index = spaces.findIndex((space) => space.id === id);
    if (index === -1) {
      return;
    }
    startTransition(async () => {
      const deleteSpaceId = spaces.at(index)?.id;
      if (deleteSpaceId === undefined) {
        return;
      }
      const newSpaces = [...spaces];
      newSpaces.splice(index, 1);
      setSpaces(newSpaces);
      if (spaceId === deleteSpaceId) {
        router.push(`${SPACE_URL}`);
      }
      await db.space.$delete(deleteSpaceId);
    });
  };
  const recoverFromTrash = (id: string) => {
    log("recoverFromTrash", { id });
    if (isPending) {
      return;
    }
    const newSpaces = [...spaces];
    const index = spaces.findIndex((space) => space.id === id);
    if (index === -1) {
      return;
    }
    newSpaces[index] = { ...spaces[index], isDeleted: false };
    setSpaces(newSpaces);
    startTransition(async () => {
      await db.space.$update(id, undefined, undefined, false);
    });
  };
  const moveToTrash = (id: string) => {
    log("moveToTrash", { id });
    if (isPending) {
      return;
    }
    const newSpaces = [...spaces];
    const index = spaces.findIndex((space) => space.id === id);
    if (index === -1) {
      return;
    }
    newSpaces[index] = { ...spaces[index], isDeleted: true };
    setSpaces(newSpaces);
    startTransition(async () => {
      await db.space.$update(id, undefined, undefined, true);
    });
  };
  const updateSpace = (id: string, title?: string, content?: string) => {
    log("updateSpace", { id, title, content });
    if (isPending) {
      return;
    }
    if (title === undefined && content === undefined) {
      return;
    }
    const newSpaces = [...spaces];
    const index = spaces.findIndex((space) => space.id === id);
    if (index === -1) {
      return;
    }
    newSpaces[index] = { ...spaces[index] };
    if (title !== undefined) {
      newSpaces[index].title = title;
    }
    if (content !== undefined) {
      newSpaces[index].content = content;
    }
    setSpaces(newSpaces);
    startTransition(async () => {
      await db.space.$update(id, title, content);
    });
  };

  return (
    <SpacesContext.Provider
      value={{
        spaces,
        isInit: isIniting,
        isPending,
        createSpace,
        updateSpace,
        deleteSpace,
        moveToTrash,
        recoverFromTrash,
        choosedSpace,
      }}
    >
      {children}
    </SpacesContext.Provider>
  );
};
