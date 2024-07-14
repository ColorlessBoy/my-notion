import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SidebarToggleProps {
  isOpen: boolean;
  switchOpen: () => void;
  width: number;
  setWidth: (newWidth: number) => void;
}

export const useSidebarState = create(
  persist<SidebarToggleProps>(
    (set, get) => ({
      isOpen: true,
      switchOpen: () => {
        console.log("switch open", !get().isOpen);
        set({ ...get(), isOpen: !get().isOpen });
      },
      width: 240,
      setWidth: (newWidth) => {
        set({ ...get(), width: newWidth });
      },
    }),
    {
      name: "sidebarState",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
