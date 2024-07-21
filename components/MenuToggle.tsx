"use client";
import { cn } from "@/lib/utils";
import { ChevronsLeft, MenuIcon } from "lucide-react";
import { useStore } from "zustand";
import { useSidebarState } from "@/hooks/useSidebarToggle";
import { Button } from "./ui/button";

type MenuToggleProps = {
  className?: string;
};

export default function MenuToggle({ className }: MenuToggleProps) {
  const sidebarState = useStore(useSidebarState, (state) => state);
  return (
    <Button
      onClick={sidebarState.switchOpen}
      className={cn(
        "rounded-sm w-8 h-8 p-0 border-none items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-800",
        sidebarState.isOpen ? "invisible" : "block",
        className
      )}
      variant="outline"
      size="icon"
    >
      <MenuIcon className={cn("w-auto h-auto")} />
    </Button>
  );
}
