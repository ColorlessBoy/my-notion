"use client";

import { BookIcon, ChevronUp, Loader2, Plus, Redo, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Space } from "@prisma/client";
import { cn, stringToColor } from "@/lib/utils";
import { KeyboardEventHandler, useCallback, useState } from "react";
import { Button } from "../ui/button";
import { debounce } from "lodash";

interface SidebarSpaceCardProps {
  space: Space;
  isActive: boolean;
  className?: string;
  titleClassName?: string;
  onDelete?: () => Promise<void>;
  onSave?: (space: Space) => Promise<void>;
  onMoveToTrash?: () => Space;
  onRecoverFromTrash?: () => Space;
  onUpdateTitle?: (newTitle: string) => Space;
  onChangeRoute?: () => void;

  openable?: boolean;
}

export function SidebarSpaceCard({
  space,
  isActive,
  className,
  titleClassName,
  onDelete,
  onSave,
  onMoveToTrash,
  onRecoverFromTrash,
  onUpdateTitle,
  onChangeRoute,

  openable,
}: SidebarSpaceCardProps) {
  const [showTool, setShowTool] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [isOpen, setOpen] = useState(isActive);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedSave = useCallback(
    debounce(async (space: Space) => {
      if (onSave) {
        setIsSaving(true);
        await onSave(space);
        setIsSaving(false);
      }
    }, 300),
    []
  );
  const internalOnDelete = () => {
    if (onDelete) {
      setIsSaving(true);
      onDelete().then(() => {
        setIsSaving(false);
      });
    }
  };
  const internalOnMoveToTrash = () => {
    if (onMoveToTrash) {
      const space = onMoveToTrash();
      debouncedSave(space);
    }
  };
  const internalOnRecoverFromTrash = () => {
    if (onRecoverFromTrash) {
      const space = onRecoverFromTrash();
      debouncedSave(space);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center pr-1 gap-x-1 hover:bg-gray-200 flex-nowrap",
          isActive && "bg-gray-200",
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
          onChange={onUpdateTitle}
          onSave={() => {
            debouncedSave(space);
          }}
          value={space.title}
          isEditing={isEditing && !isSaving}
          setEditing={setEditing}
          onClick={onChangeRoute}
          className={titleClassName}
        />
        <div className={cn("flex-row space-x-0 p-0 m-0")}>
          {!isSaving && showTool && !isEditing && onRecoverFromTrash && (
            <RecoverButton onRecover={internalOnRecoverFromTrash} />
          )}
          {!isSaving && showTool && !isEditing && onDelete && (
            <DeleteButton onDelete={internalOnDelete} />
          )}
          {!isSaving && showTool && !isEditing && onMoveToTrash && (
            <DeleteButton onDelete={internalOnMoveToTrash} />
          )}
          {!isSaving && !isEditing && openable && (
            <OpenButton
              isOpen={isOpen}
              setOpen={() => {
                setOpen(!isOpen);
              }}
            />
          )}
          {isSaving && (
            <Loader2
              className={cn(
                "bg-transparent w-7 h-7 p-0 m-0 border-none text-primary animate-spin"
              )}
            />
          )}
        </div>
      </div>
      {/* items && (
        <div className={cn("w-full m-0", !isOpen && "h-0 w-0 opacity-0")}>
          {isIniting ? (
            <span className="flex-1 pl-2 text-nowrap text-ellipsis text-gray-500">
              目录加载中...
            </span>
          ) : (
            <SortableTree
              items={items}
              setItems={setItems}
              collapsible
              indicator
              creatable
              editable
              removable
              createNewChild={createNewChild}
              updateTitle={updateTitle}
            />
          )}
        </div>
      ) */}
    </>
  );
}

export function SidebarSpaceCardSkeleton({
  className,
  titleClassName,
}: {
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center pr-1 gap-x-1 hover:bg-gray-200 flex-nowrap",
        className
      )}
    >
      <Skeleton className="w-7 h-7" />
      <Skeleton
        className={cn("font-medium text-lg text-nowrap flex-1", titleClassName)}
      />
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
  onSave,
  isSaving,
  className,
  isEditing,
  setEditing,
  onClick,
}: {
  value: string | null;
  onChange?: (newTitle: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  className?: string;
  isEditing?: boolean;
  setEditing?: (b: boolean) => void;
  onClick?: () => void;
}) {
  const handleDoubleClick = () => {
    if (onChange && setEditing) {
      setEditing(true);
    }
  };
  const handleBlur = () => {
    setEditing && setEditing(false);
    onSave && onSave();
  };
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setEditing && setEditing(false);
      onSave && onSave();
    }
  };
  return onChange && isEditing && !isSaving ? (
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
      onClick={onClick}
    >
      {value || "无标题"}
    </span>
  );
}
