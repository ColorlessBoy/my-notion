import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronsLeft } from "lucide-react";

type SidebarToggleProps = {
  isOpen: boolean;
  switchOpen: () => void;
  className?: string;
};

export default function SidebarToggle({
  isOpen,
  switchOpen: switchOpen,
  className,
}: SidebarToggleProps) {
  return (
    <Button
      onClick={switchOpen}
      className={cn(
        "rounded-sm w-8 h-8 p-0 border-none bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800",
        className
      )}
      variant="outline"
      size="icon"
    >
      <ChevronsLeft
        className={cn(
          "transition-transform ease-in-out duration-300 w-auto h-auto",
          isOpen === false ? "rotate-180" : "rotate-0"
        )}
      />
    </Button>
  );
}
