"use client";

import { useSidebarState } from "@/hooks/useSidebarToggle";
import { cn } from "@/lib/utils";
import { useStore } from "zustand";
import SidebarToggle from "./SidebarToggle";
import { useEffect, useRef, useState } from "react";

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const sidebarState = useStore(useSidebarState, (state) => state);
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDownForResizing = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (!sidebarState.isOpen) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMoveForResizing);
    document.addEventListener("mouseup", handleMouseUpForResizing);
  };

  const handleMouseMoveForResizing = (e: MouseEvent) => {
    if (!isResizingRef.current) return;

    let newWidth = e.clientX;
    if (newWidth < 240) {
      newWidth = 240;
    } else if (newWidth > 480) {
      newWidth = 480;
    }
    sidebarState.setWidth(newWidth);

    if (sidebarRef.current) {
      sidebarRef.current.style.setProperty("width", `${newWidth}px`);
    }
  };

  const handleMouseUpForResizing = () => {
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMoveForResizing);
    document.removeEventListener("mouseup", handleMouseUpForResizing);
  };

  useEffect(() => {
    if (sidebarRef.current && isResizingRef.current === false) {
      if (sidebarState.isOpen === true) {
        sidebarRef.current.style.setProperty(
          "width",
          `${sidebarState.width}px`
        );
      } else {
        sidebarRef.current.style.setProperty("width", `0px`);
      }
    }
  }, [sidebarState.isOpen]);

  if (sidebarState === undefined) return null;

  return (
    <aside
      className={cn(
        "relative top-0 z-[999] h-full flex-col overflow-y-auto bg-secondary",
        !isResizingRef.current && "transition-all ease-in-out duration-300"
      )}
      style={{ width: `${sidebarState.width}px` }}
      ref={sidebarRef}
    >
      <SidebarToggle
        className={cn("absolute top-0 right-0")}
        isOpen={sidebarState.isOpen}
        switchOpen={sidebarState.switchOpen}
      />
      <div className="text-nowrap">Sidebar content</div>
      <div
        onMouseDown={handleMouseDownForResizing}
        className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-primary/5 opacity-10 transition hover:opacity-100"
      />
    </aside>
  );
}
