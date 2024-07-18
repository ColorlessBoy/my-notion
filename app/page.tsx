"use client";
import DraggableTree from "@/components/DraggableTree/DraggableTree";
import { Item } from "@/components/DraggableTree/types";
import Sidebar from "@/components/Sidebar";
import SidebarToggle from "@/components/Sidebar/SidebarToggle";
import { useSidebarState } from "@/hooks/useSidebarToggle";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";

const treeItems: Item[] = [
  {
    id: "1",
    title: "1",
    index: 0,
    level: 0,
    isOpen: true,
  },
  {
    id: "1.1",
    title: "1.1",
    index: 1,
    level: 1,
    isOpen: true,
  },
  {
    id: "1.2",
    title: "1.2",
    index: 2,
    level: 1,
    isOpen: true,
  },
  {
    id: "2",
    title: "2",
    index: 3,
    level: 0,
    isOpen: true,
  },
  {
    id: "2.1",
    title: "2.1",
    index: 4,
    level: 1,
    isOpen: true,
  },
  {
    id: "2.2",
    title: "2.2",
    index: 5,
    level: 1,
    isOpen: true,
  },
  {
    id: "3",
    title: "3",
    index: 6,
    level: 0,
    isOpen: true,
  },
  {
    id: "3.1",
    title: "3.1",
    index: 7,
    level: 1,
    isOpen: true,
  },
  {
    id: "3.2",
    title: "3.2",
    index: 8,
    level: 1,
    isOpen: true,
  },
];

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
        <div className="flex flex-col m-10">
          <h1 className="flex-row justify-center items-center m-2 p-2">
            Main Page
          </h1>
          <SidebarToggle
            isOpen={sidebarState.isOpen}
            switchOpen={sidebarState.switchOpen}
          />
          <DraggableTree items={treeItems} className="w-[350px]" />
        </div>
      </main>
    </>
  );
}
