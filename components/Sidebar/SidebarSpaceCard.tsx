"use client";

import { BookIcon, ChevronUp, Plus, Redo, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Space } from "@prisma/client";
import { cn, stringToColor } from "@/lib/utils";
import {
  KeyboardEventHandler,
  useEffect,
  useState,
  useTransition,
} from "react";
import { Button } from "../ui/button";
import { SortableTree } from "../SortableTree";
import { TreeItem } from "../SortableTree/types";
import { createNewChild } from "../SortableTree/utilities";
import * as db from "@/db";

interface SidebarSpaceCardProps {
  space: Space;
  isActive: boolean;
  className?: string;
  onTrash?: () => void;
  onDelete?: () => void;
  onRecover?: () => void;
  onChange?: (newTitle: string) => void;
  onCreate?: () => void;
  openable?: boolean;
}

export function SidebarSpaceCard({
  space,
  isActive,
  className,
  onTrash,
  onDelete,
  onRecover,
  onChange,
  onCreate,
  openable,
}: SidebarSpaceCardProps) {
  const [showTool, setShowTool] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [items, setItems] = useState<TreeItem[]>([]);

  const [isIniting, startInit] = useTransition();

  useEffect(() => {
    startInit(async () => {
      const toc = await db.tableOfContent.$getLatest(space.id);
      if (toc !== null && toc.content !== null) {
        const newItems = JSON.parse(toc.content) as TreeItem[];
        setItems(newItems);
      }
    });
  }, []);

  const setAndSaveItems = (newItems: TreeItem[]) => {
    setItems(newItems);
    db.tableOfContent.$create(space.id, JSON.stringify(items));
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center pr-1 gap-x-1 hover:bg-gray-200 flex-nowrap",
          className
        )}
        onMouseEnter={() => {
          setShowTool(true);
        }}
        onMouseLeave={() => {
          setShowTool(false);
        }}
      >
        <BookIcon
          className="w-7 h-7"
          style={{ fill: stringToColor(space.title) }}
        />
        <SidebarEditContent
          className={cn(isActive && "bg-gray-400")}
          onChange={onChange}
          value={space.title}
          isEditing={isEditing}
          setEditing={setEditing}
        />
        <div className="flex-row space-x-0 p-0 m-0">
          {showTool && !isEditing && onDelete && (
            <DeleteButton onDelete={onDelete} />
          )}
          {showTool && !isEditing && onRecover && (
            <RecoverButton onRecover={onRecover} />
          )}
          {showTool && !isEditing && onTrash && (
            <DeleteButton onDelete={onTrash} />
          )}
          {showTool && !isEditing && (
            <CreateNewNoteButton
              onCreate={() => {
                const newItems = createNewChild(items);
                setItems(newItems);
                setOpen(true);
              }}
            />
          )}
          {!isEditing && openable && (
            <OpenButton
              isOpen={isOpen}
              setOpen={() => {
                setOpen(!isOpen);
              }}
            />
          )}
        </div>
      </div>

      <div className={cn("w-full m-0", !isOpen && "h-0 w-0 opacity-0")}>
        {isIniting ? (
          <span className="flex-1 pl-2 text-nowrap text-ellipsis text-gray-500">
            目录加载中...
          </span>
        ) : (
          <SortableTree
            items={items}
            setItems={setAndSaveItems}
            collapsible
            indicator
            creatable
            editable
            removable
          />
        )}
      </div>
    </>
  );
}

export function SidebarSpaceCardSkeleton() {
  return (
    <div className="flex items-center gap-x-2">
      <Skeleton className="w-10 h-10" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function OpenButton({
  isOpen,
  setOpen,
}: {
  isOpen: boolean;
  setOpen: () => void;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn("bg-transparent w-7 h-7 p-0 m-0 border-none text-primary")}
      onClick={setOpen}
    >
      <ChevronUp
        className={cn(
          "w-auto h-auto m-0 p-0",
          "transition-transform ease-in-out duration-300",
          isOpen && "rotate-180"
        )}
      />
    </Button>
  );
}

export function CreateNewNoteButton({ onCreate }: { onCreate: () => void }) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn("bg-transparent w-7 h-7 p-0 m-0 border-none text-primary")}
      onClick={onCreate}
    >
      <Plus className={cn("w-auto h-auto m-0 p-0")} />
    </Button>
  );
}

export function RecoverButton({ onRecover }: { onRecover: () => void }) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn("bg-transparent w-7 h-7 p-0 m-0 border-none text-primary")}
      onClick={onRecover}
    >
      <Redo className={cn("w-auto h-auto m-0 p-0")} />
    </Button>
  );
}

export function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn("bg-transparent w-7 h-7 p-0 m-0 border-none text-primary")}
      onClick={onDelete}
    >
      <X className={cn("w-auto h-auto")} />
    </Button>
  );
}

export function SidebarEditContent({
  value,
  onChange,
  className,
  isEditing,
  setEditing,
}: {
  value: string | null;
  onChange?: (newTitle: string) => void;
  className?: string;
  isEditing?: boolean;
  setEditing?: (b: boolean) => void;
}) {
  const handleDoubleClick = () => {
    if (onChange && setEditing) {
      setEditing(true);
    }
  };
  const handleBlur = () => {
    setEditing && setEditing(false);
  };
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setEditing && setEditing(false);
    }
  };
  return onChange && isEditing ? (
    <input
      className={cn(
        "font-medium text-lg text-nowrap flex-1 w-[80%]",
        className
      )}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  ) : (
    <span
      className={cn("font-medium text-lg text-nowrap flex-1", className)}
      onDoubleClick={handleDoubleClick}
    >
      {value || "无标题"}
    </span>
  );
}
