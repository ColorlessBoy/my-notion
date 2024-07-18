"use client";
import { Item } from "@/components/DraggableTree/types";
import Sidebar from "@/components/Sidebar";
import SidebarToggle from "@/components/Sidebar/SidebarToggle";
import { SortableTree } from "@/components/SortableTree";
import { TreeItem } from "@/components/SortableTree/types";
import { useSidebarState } from "@/hooks/useSidebarToggle";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { v4 as uuid } from "uuid";

const initialItems: TreeItem[] = [
  {
    id: uuid(),
    title: "Home",
    children: [],
  },
  {
    id: uuid(),
    title: "Collections",
    children: [
      { id: uuid(), title: "Spring", children: [] },
      { id: uuid(), title: "Summer", children: [] },
      { id: uuid(), title: "Fall", children: [] },
      { id: uuid(), title: "Winter", children: [] },
    ],
  },
  {
    id: uuid(),
    title: "About Us",
    children: [],
  },
  {
    id: uuid(),
    title: "My Account",
    children: [
      { id: uuid(), title: "Addresses", children: [] },
      { id: uuid(), title: "Order History", children: [] },
    ],
  },
];

export default function Home() {
  const sidebarState = useStore(useSidebarState, (state) => state);
  const mouseMoveDivRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto items-center justify-center">
        <div className="flex flex-col">
          <h1 className="flex-row justify-center items-center m-2 p-2">
            Main Page
          </h1>
          <SidebarToggle
            isOpen={sidebarState.isOpen}
            switchOpen={sidebarState.switchOpen}
          />
          <div className="w-[350px] w-max-[100%] p-2 mx-auto mb-0 mt-[10%]">
            <SortableTree
              initialItems={initialItems}
              collapsible
              indicator
              creatable
              editable
              removable
            />
          </div>
        </div>
      </main>
    </>
  );
}
