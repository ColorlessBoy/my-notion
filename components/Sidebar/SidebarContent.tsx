"use client";
import { useContext, useState } from "react";
import { FollowHead } from "../FollowIcon";
import { SpacesContext } from "@/components/providers/SpacesProvider";
import { SidebarSpaceCard, SidebarSpaceCardSkeleton } from "./SidebarSpaceCard";
import { Button } from "../ui/button";
import Link from "next/link";
import { SPACE_URL } from "@/routes";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { Space } from "@prisma/client";
import { TreeItem } from "../SortableTree/types";
import { UniqueIdentifier } from "@dnd-kit/core";

export function SidebarContent() {
  return (
    <>
      <FollowHead className="flex justify-center items-center my-10" />
      <SpaceShelfButton />
      <SpaceList />
      <CreateNewSpaceButton />
      <SpaceTrashContent />
    </>
  );
}

export function SpaceShelfButton() {
  return (
    <Button
      asChild
      variant="link"
      className="text-xl m-2 border-y-2 w-auto flex items-center justify-center"
    >
      <Link href={SPACE_URL}>书架</Link>
    </Button>
  );
}

export function CreateNewSpaceButton() {
  const spacesContext = useContext(SpacesContext);
  const [isCreating, setIsCreating] = useState(false);
  const onClick = () => {
    if (!isCreating && spacesContext?.createSpace) {
      setIsCreating(true);
      spacesContext.createSpace().then(() => {
        setIsCreating(false);
      });
    }
  };
  return (
    <div
      role="button"
      onClick={onClick}
      className={cn(
        "flex items-center pr-1 gap-x-1 hover:bg-gray-200 flex-nowrap rounded-sm text-gray-500 my-4"
      )}
    >
      {isCreating ? (
        <Loader2 className="w-7 h-7 bg-transparent animate-spin" />
      ) : (
        <Plus className="w-7 h-7 bg-transparent" />
      )}
      <span className="font-medium text-lg text-nowrap flex-1 bg-transparent">
        新建书籍
      </span>
    </div>
  );
}

export function SpaceList() {
  const spacesContext = useContext(SpacesContext);
  const { spaceId, noteId } = useParams<{
    spaceId?: string;
    noteId?: string;
  }>();
  const router = useRouter();
  if (spacesContext === undefined || spacesContext?.isLoading) {
    return (
      <>
        <SidebarSpaceCardSkeleton />;
        <SidebarSpaceCardSkeleton />;
        <SidebarSpaceCardSkeleton />;
      </>
    );
  }
  return spacesContext.spaces
    .filter((space) => space.isDeleted !== true)
    .map((space) => {
      return (
        <SidebarSpaceCard
          key={space.id}
          space={space}
          isActive={spaceId === space.id}
          onSave={async (space: Space) => {
            await spacesContext.saveSpace(space);
          }}
          onMoveToTrash={() => {
            return spacesContext.updateSpace(space, undefined, undefined, true);
          }}
          onUpdateTitle={(newTitle: string) => {
            return spacesContext.updateSpace(space, newTitle);
          }}
          onChangeRoute={() => {
            router.push(`${SPACE_URL}/${space.id}`);
          }}
          openable
          fetchItems={() => spacesContext.fetchToc(space.id)}
          items={spacesContext.getToc(space.id)}
          setItems={(items: TreeItem[]) => {
            spacesContext.setToc(space.id, items);
          }}
          onCreateItemChild={() => spacesContext.createTreeItem(space.id)}
          onUpdateItemTitle={(noteId, newTitile) =>
            spacesContext.updateNoteTitle(space.id, noteId as string, newTitile)
          }
          onSaveItem={(item: TreeItem) => {
            spacesContext.saveNote(space.id, item.id as string);
          }}
          onSaveItems={(items: TreeItem[]) =>
            spacesContext.saveToc(space.id, items)
          }
          onChangeItemRoute={(noteId: UniqueIdentifier) => {
            router.push(`${SPACE_URL}/${space.id}/${noteId}`);
          }}
          selectedNoteId={noteId}
        />
      );
    });
}

export function SpaceTrashContent() {
  const spacesContext = useContext(SpacesContext);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="space-trash">
        <AccordionTrigger>
          <div className="flex space-x-1 items-center flex-nowrap">
            <Trash2 className="w-7 h-7" />
            <span className="font-medium text-lg text-nowrap">回收站</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {spacesContext?.spaces
            .filter((space) => space.isDeleted === true)
            .map((space) => {
              return (
                <SidebarSpaceCard
                  key={space.id}
                  space={space}
                  isActive={false}
                  className="pl-2"
                  onSave={async (space: Space) => {
                    await spacesContext.saveSpace(space);
                  }}
                  onDelete={async () => {
                    spacesContext.deleteSpace(space.id);
                  }}
                  onRecoverFromTrash={() => {
                    return spacesContext.updateSpace(
                      space,
                      undefined,
                      undefined,
                      false
                    );
                  }}
                />
              );
            })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
