import MenuToggle from "@/components/MenuToggle";
import { SidebarWrapper } from "@/components/Sidebar";
import { SortableTree } from "@/components/SortableTree";
import { TreeItem } from "@/components/SortableTree/types";
import { Button } from "@/components/ui/button";
import { SPACE_URL } from "@/routes";
import Link from "next/link";
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
  return (
    <>
      <SidebarWrapper>
        <Button
          asChild
          type="button"
          variant="link"
          className="group w-full flex justify-center pr-2"
        >
          <Link href={SPACE_URL} className="w-full text-center text-3xl">
            <span>空间</span>
          </Link>
        </Button>
      </SidebarWrapper>
      <main className="relative flex-1 h-full overflow-y-auto items-center justify-center">
        <MenuToggle />
        <div className="flex flex-col">
          <h1 className="flex-row justify-center items-center m-2 p-2">
            Main Page
          </h1>
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
