import { cn } from "@/lib/utils";
import { ChevronRight, PlusIcon, Trash2, Trash2Icon } from "lucide-react";
import { CSSProperties, MouseEvent, ReactNode, useState } from "react";
import { AbovePart, Item } from "./types";
import { Button } from "../ui/button";

type DraggableItemProps<T extends Item> = {
  item: T;
  addItemChild: () => void;
  deleteItem: () => void;
  updateItem: (item: T) => void;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function DraggableTreeItem<T extends Item>({
  item,
  addItemChild,
  deleteItem,
  updateItem,
  children,
  className,
  style,
}: DraggableItemProps<T>) {
  const switchOpen = () => {
    updateItem({ ...item, isOpen: !item.isOpen });
  };
  const [showTools, setShowTools] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden overflow-ellipsis whitespace-nowrap m-0",
        "p-0 font-mono w-auto m-auto bg-transparent transition-opacity duration-200 border-solid border-2 border-gray-800 rounded-md flex flex-row justify-between items-center",
        className
      )}
      style={style}
      onMouseEnter={() => setShowTools(true)}
      onMouseLeave={() => {
        setShowTools(false);
      }}
    >
      <div className="flex flex-1 flex-row items-center">
        <Button
          onClick={switchOpen}
          className={cn(
            "rounded-sm w-6 h-6 p-0 m-1 border-none bg-transparent hover:bg-gray-300",
            className
          )}
          variant="outline"
          size="icon"
        >
          <ChevronRight
            className={cn(
              "transition-transform ease-in-out duration-100 w-auto h-auto",
              item.isOpen === true ? "rotate-90" : "rotate-0"
            )}
          />
        </Button>
        <div className="flex w-full justify-between items-center">
          {children}
          {confirmingDelete && (
            <div className="flex mr-2 space-x-1">
              <div
                onClick={() => {
                  setConfirmingDelete(false);
                }}
                className="p-[2px] bg-red-400 text-sm rounded-sm cursor-pointer"
              >
                取消
              </div>
              <div
                onClick={deleteItem}
                className="p-[2px] bg-green-400 text-sm rounded-sm cursor-pointer"
              >
                确认
              </div>
            </div>
          )}
          {showTools && !confirmingDelete && (
            <div className="flex mr-2 space-x-1">
              <div
                className="rounded-sm w-6 h-6 p-0 border-none bg-transparent hover:bg-gray-300"
                onClick={() => {
                  setConfirmingDelete(true);
                }}
              >
                <Trash2Icon />
              </div>
              <div
                className="rounded-sm w-6 h-6 p-0 border-none bg-transparent hover:bg-gray-300"
                onClick={addItemChild}
              >
                <PlusIcon />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
