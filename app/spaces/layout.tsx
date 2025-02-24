import { ReactNode } from "react";
import {
  SpacesContext,
  SpacesProvider,
} from "@/components/providers/SpacesProvider";
import { SidebarWrapper } from "@/components/Sidebar";
import MenuToggle from "@/components/MenuToggle";
import { SidebarContent } from "@/components/Sidebar/SidebarContent";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SpacesProvider userId="testuser">
        <SidebarWrapper>
          <SidebarContent />
        </SidebarWrapper>
        <main className="relative flex-1 h-auto overflow-y-auto items-center justify-center m-5">
          <MenuToggle className="sticky top-0 left-0" />
          {children}
        </main>
      </SpacesProvider>
    </>
  );
}
