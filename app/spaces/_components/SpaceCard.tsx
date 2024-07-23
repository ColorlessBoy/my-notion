import { cn, vibrantColors } from "@/lib/utils";
import { KeyboardEventHandler, ReactNode, useCallback, useState } from "react";
import { Loader2, PlusIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { Space } from "@prisma/client";

interface SpaceCardProps {
  space?: Space;
  onMoveToTrash?: () => Space;
  onUpdateTitle?: (newTitle: string) => Space;
  onSave?: (space: Space) => Promise<void>;
  onCreate?: () => Promise<void>;
  onChangeRoute?: () => void;
  className?: string;
  backgroundColor?: string;
  isAddCard?: boolean;
}

export default function SpaceCard({
  space,
  onMoveToTrash,
  onUpdateTitle,
  onSave,
  onCreate,
  onChangeRoute,
  className,
  backgroundColor = vibrantColors[0],
  isAddCard,
}: SpaceCardProps) {
  const [showTool, setShowTool] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setEditing] = useState(false);

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
  const internalOnMoveToTrash = () => {
    if (onMoveToTrash) {
      const space = onMoveToTrash();
      debouncedSave(space);
    }
  };
  const internalOnCreate = () => {
    if (onCreate) {
      setIsSaving(true);
      onCreate().then(() => {
        setIsSaving(false);
      });
    }
  };

  return (
    <div
      className={cn(
        "aspect-video shrink-0 relative rounded-sm flex flex-col gap-y-1 items-center justify-center transition shadow-md",
        !isAddCard && "hover:opacity-90 hover:scale-110",
        className
      )}
      onMouseEnter={() => {
        setShowTool(true);
      }}
      onMouseLeave={() => {
        setShowTool(false);
      }}
    >
      <div
        className="absolute top-0 left-0 -z-[999] w-full h-full"
        style={{ backgroundColor: backgroundColor }}
        onClick={onChangeRoute}
      />
      {!isAddCard && space && (
        <SpaceCardEditableContent
          value={space.title}
          onChange={onUpdateTitle}
          onSave={() => {
            debouncedSave(space);
          }}
          isSaving={isSaving}
          isEditing={isEditing}
          setEditing={setEditing}
        />
      )}

      {!isAddCard &&
        space &&
        !isEditing &&
        !isSaving &&
        showTool &&
        onMoveToTrash && (
          <Button
            asChild
            variant="outline"
            className={cn(
              "absolute top-0 right-0 bg-transparent w-8 h-8 p-0 m-1 border-none"
            )}
            onClick={internalOnMoveToTrash}
          >
            <X
              className={cn(
                "w-auto h-auto",
                "transition-transform ease-in-out duration-300",
                "hover:scale-125"
              )}
            />
          </Button>
        )}

      {isAddCard && (
        <SpaceCardAddContent onCreate={internalOnCreate} isSaving={isSaving} />
      )}
      {!isAddCard && isSaving && (
        <Button
          asChild
          variant="outline"
          className={cn(
            "absolute top-0 right-0 bg-transparent w-8 h-8 p-0 m-1 border-none"
          )}
        >
          <Loader2
            className={cn(
              "w-auto h-auto animate-spin",
              "transition-transform ease-in-out duration-300",
              "hover:scale-125"
            )}
          />
        </Button>
      )}
    </div>
  );
}

interface SpaceCardAddContentProps {
  onCreate?: () => void;
  isSaving?: boolean;
}

export function SpaceCardAddContent({
  onCreate,
  isSaving,
}: SpaceCardAddContentProps) {
  return isSaving ? (
    <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
  ) : (
    <Button
      asChild
      variant="outline"
      className={cn(
        "w-10 h-10 bg-transparent",
        "transition-transform ease-in-out duration-300",
        "hover:scale-125"
      )}
      onClick={onCreate}
    >
      <PlusIcon className="w-auto h-auto text-gray-500" />
    </Button>
  );
}

interface SpaceCardEditableContentProps {
  value: string | null;
  onChange?: (value: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  isEditing?: boolean;
  setEditing?: (b: boolean) => void;
  className?: string;
}

export function SpaceCardEditableContent({
  value,
  onChange,
  onSave,
  isSaving,
  isEditing,
  setEditing,
  className,
}: SpaceCardEditableContentProps) {
  const [oldValue, setOldValue] = useState("");
  const handleDoubleClick = () => {
    if (onChange && setEditing) {
      setEditing(true);
      setOldValue(value || "");
    }
  };
  const handleBlur = () => {
    setEditing && setEditing(false);
    if (onSave && oldValue !== value) {
      onSave();
    }
    setOldValue("");
  };
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setEditing && setEditing(false);
      if (onSave && oldValue !== value) {
        onSave();
      }
      setOldValue("");
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditing && setEditing(false);
      onChange && onChange(oldValue);
      setOldValue("");
    }
  };

  return onChange && isEditing && !isSaving ? (
    <input
      className={cn("text-xl font-bold text-center p-2 w-[90%]", className)}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  ) : (
    <span
      className={cn("text-xl font-bold p-0 m-0", className)}
      onDoubleClick={handleDoubleClick}
    >
      {value || "无标题"}
    </span>
  );
}
