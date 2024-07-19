"use client";

import { BookIcon, Plus, Redo, Trash2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Space } from "@prisma/client";
import { cn, stringToColor } from "@/lib/utils";
import { KeyboardEventHandler, useState } from "react";
import { Button } from "../ui/button";
import { SpaceCardEditableContent } from "@/app/spaces/_components/SpaceCard";

interface SidebarSpaceCardProps {
  space: Space;
  isActive: boolean;
  className?: string;
  onTrash?: () => void;
  onDelete?: () => void;
  onRecover?: () => void;
  onChange?: (newTitle: string) => void;
  onCreate?: () => void;
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
}: SidebarSpaceCardProps) {
  const [showTool, setShowTool] = useState(false);
  const [isEditing, setEditing] = useState(false);

  return (
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
      <div className="space-x-0 p-0 m-0">
        {showTool && !isEditing && onTrash && (
          <DeleteButton onDelete={onTrash} />
        )}
        {showTool && !isEditing && onCreate && (
          <CreateNewNoteButton onCreate={onCreate} />
        )}
        {showTool && !isEditing && onDelete && (
          <DeleteButton onDelete={onDelete} />
        )}
        {showTool && !isEditing && onRecover && (
          <RecoverButton onRecover={onRecover} />
        )}
      </div>
    </div>
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
