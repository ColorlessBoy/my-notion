"use client";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronsLeft } from "lucide-react";
import { useStore } from "zustand";
import { useSidebarState } from "@/hooks/useSidebarToggle";

type SidebarToggleProps = {
  className?: string;
};

export function SidebarToggle({ className }: SidebarToggleProps) {
  const sidebarState = useStore(useSidebarState, (state) => state);
  return (
    <Button
      onClick={sidebarState.switchOpen}
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
          sidebarState.isOpen === false ? "rotate-180" : "rotate-0"
        )}
      />
    </Button>
  );
}
