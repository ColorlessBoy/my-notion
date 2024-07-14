"use client";
import Sidebar from "@/components/Sidebar";
import SidebarToggle from "@/components/Sidebar/SidebarToggle";
import { useSidebarState } from "@/hooks/useSidebarToggle";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";

export default function Home() {
  const sidebarState = useStore(useSidebarState, (state) => state);
  const mouseMoveDivRef = useRef<HTMLDivElement>(null);
  const callback = (event: MouseEvent) => {
    if (mouseMoveDivRef.current) {
      mouseMoveDivRef.current.innerText = `(${event.screenX}, ${event.screenY})`;
    }
  };
  useEffect(() => {
    document.addEventListener("mousemove", callback);
    return () => {
      document.removeEventListener("mousemove", callback);
    };
  }, []);
  return (
    <>
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto items-center justify-center">
        <h1 className="flex-row justify-center items-center m-2 p-2">
          Main Page
        </h1>
        <SidebarToggle
          isOpen={sidebarState.isOpen}
          switchOpen={sidebarState.switchOpen}
        />
      </main>
    </>
  );
}
