import { cn, vibrantColors } from "@/lib/utils";
import { KeyboardEventHandler, ReactNode, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpaceCardProps {
  children: ReactNode;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
  backgroundColor?: string;
}

export default function SpaceCard({
  children,
  onClick,
  onDelete,
  className,
  backgroundColor = vibrantColors[0],
}: SpaceCardProps) {
  const [showTool, setShowTool] = useState(false);
  return (
    <div
      role="button"
      onClick={onClick}
      className={cn(
        "aspect-video shrink-0 relative rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-90 hover:scale-110 transition shadow-md",
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
        className="absolute top-0 left-0 -z-[1] w-full h-full"
        style={{ backgroundColor: backgroundColor }}
      />
      {children}
      {showTool && onDelete && (
        <Button
          asChild
          variant="outline"
          className={cn(
            "absolute top-0 right-0 bg-transparent w-8 h-8 p-0 m-1 border-none"
          )}
          onClick={onDelete}
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
    </div>
  );
}

interface SpaceCardEditableContentProps {
  value: string | null;
  onChange: (value: string) => void;
  initEditing?: boolean;
  className?: string;
}
export function SpaceCardEditableContent({
  value,
  onChange,
  initEditing = false,
  className,
}: SpaceCardEditableContentProps) {
  const [isEditing, setEditing] = useState(initEditing);

  const handleDoubleClick = () => {
    setEditing(true);
  };
  const handleBlur = () => {
    setEditing(false);
  };
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setEditing(false);
    }
  };

  return isEditing ? (
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
      onDoubleClick={handleDoubleClick}
      className={cn("text-xl font-bold", className)}
    >
      {value || "无标题"}
    </span>
  );
}
