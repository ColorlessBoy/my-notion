import { cn } from "@/lib/utils";
import { DragEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { AbovePart, Item } from "./types";
import DraggableTreeItem from "./DraggableTreeItem";
import { v4 as uuid } from "uuid";

type DraggableTreeProps<T extends Item> = {
  items: T[];
  paddingLeft?: number;
  className?: string;
};

export default function DraggableTree<T extends Item>({
  items,
  paddingLeft = 24,
  className,
}: DraggableTreeProps<T>) {
  const [activate, setActivate] = useState<T | null>(null);
  const [over, setOver] = useState<T | null>(null);
  const [initialX, setInitialX] = useState<number | null>(null);
  const [initialY, setInitialY] = useState<number | null>(null);
  const [deltaX, setDeltaX] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const [abovePart, setAbovePart] = useState<AbovePart>(AbovePart.NONE);
  const [targetLevel, setTargetLevel] = useState(0);

  const [sourceItems, setSourceItems] = useState<T[]>(items);
  const targetItems = useMemo(() => {
    let filterLevel = -1;
    const target: T[] = [];
    for (const item of sourceItems) {
      if (filterLevel >= 0) {
        if (filterLevel < item.level) {
          continue;
        } else {
          filterLevel = -1;
        }
      }
      if (item.isOpen === false || item.id === activate?.id) {
        filterLevel = item.level;
      }
      target.push(item);
    }
    return target;
  }, [sourceItems, activate]);

  const handleDragStart = (activate: T) => (e: DragEvent<HTMLLIElement>) => {
    e.currentTarget.style.opacity = "0.5";
    e.dataTransfer.effectAllowed = "move";

    setActivate(activate);
    setInitialX(e.clientX);
    setInitialY(e.clientY);
    setDeltaX(0);
    setDeltaY(0);
    setAbovePart(AbovePart.MIDDLE);
    setTargetLevel(activate.level);
  };
  const getTargetLevel = (
    deltaX: number,
    preLevel?: number,
    curLevel?: number
  ) => {
    if (preLevel === undefined) {
      return 0;
    }
    if (curLevel === undefined) {
      curLevel = 0;
    }
    if (preLevel < curLevel) {
      return preLevel + 1;
    }
    if (deltaX < 0) {
      return 0;
    } else if (curLevel * paddingLeft >= deltaX) {
      return curLevel;
    } else if ((preLevel + 1) * paddingLeft <= deltaX) {
      return preLevel + 1;
    } else {
      const rst = Math.floor(deltaX / paddingLeft);
      return rst > 0 ? rst : 0;
    }
  };
  const handleDragOver = (over: T) => (e: DragEvent<HTMLLIElement>) => {
    if (initialX !== null && initialY !== null) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      const currentX = e.clientX;
      const currentY = e.clientY;
      setDeltaX(currentX - initialX);
      setDeltaY(currentY - initialY);

      const targetRect = e.currentTarget.getBoundingClientRect();
      const targetYAboveEnd = targetRect.top + targetRect.height / 6;
      const targetYMiddleStart = targetRect.top + targetRect.height / 3;
      const targetYMiddleEnd = targetRect.bottom - targetRect.height / 3;
      const targetYBelowStart = targetRect.bottom - targetRect.height / 8;
      setOver(over);

      const targetIndex = targetItems.findIndex((t) => t.id === over.id);
      if (currentY <= targetYAboveEnd) {
        setAbovePart(AbovePart.ABOVE);
        let level = targetItems.at(targetIndex - 1)?.level;
        if (targetIndex === 0) {
          level = undefined;
        } else {
          const preItem = targetItems.at(targetIndex - 1);
          if (activate && preItem?.id === activate?.id) {
            level = activate.level - 1;
          }
        }
        setTargetLevel(getTargetLevel(currentX - initialX, level, over.level));
      } else if (
        currentY >= targetYMiddleStart &&
        currentY <= targetYMiddleEnd
      ) {
        setAbovePart(AbovePart.MIDDLE);
        setTargetLevel(over.level + 1);
      } else if (currentY >= targetYBelowStart) {
        setAbovePart(AbovePart.BELOW);
        if (over.id === activate?.id) {
          setTargetLevel(activate.level);
        } else {
          let level = targetItems.at(targetIndex + 1)?.level;
          const preItem = targetItems.at(targetIndex + 1);
          if (activate && preItem?.id === activate?.id) {
            level = targetItems.at(targetIndex + 2)?.level;
          }
          setTargetLevel(
            getTargetLevel(currentX - initialX, over.level, level)
          );
        }
      }
    }
  };

  const handleDragEnd = (over: T) => (e: DragEvent<HTMLLIElement>) => {
    e.currentTarget.style.opacity = "1";

    if (activate) {
      setActivate(null);
      setInitialX(null);
      setInitialY(null);
      setDeltaX(0);
      setDeltaY(0);
      setAbovePart(AbovePart.NONE);
      setTargetLevel(0);
    }
  };
  const handleDrop = (drop: T) => (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    if (activate === null) {
      return;
    }
    if (
      drop.id === activate.id &&
      (targetLevel === activate.level || abovePart === AbovePart.MIDDLE)
    ) {
      return;
    }
    const activeList: T[] = [activate];
    for (let i = activate.index + 1; i < sourceItems.length; i++) {
      if (sourceItems[i].level > activate.level) {
        activeList.push(sourceItems[i]);
      } else {
        break;
      }
    }
    const deltaLevel = targetLevel - activate.level;
    activeList.forEach((item) => {
      item.level += deltaLevel;
    });

    const newList = [...sourceItems];
    newList.splice(activate.index, activeList.length);
    let dropIndex = drop.index;
    if (drop.index > activate.index) {
      dropIndex = drop.index - activeList.length;
    } else if (drop.index === activate.index) {
      if (abovePart === AbovePart.BELOW) {
        dropIndex -= 1;
      }
    }
    if (abovePart === AbovePart.ABOVE) {
      newList.splice(dropIndex, 0, ...activeList);
    } else if (abovePart === AbovePart.BELOW) {
      newList.splice(dropIndex + 1, 0, ...activeList);
    } else {
      // AbovePart.MIDDLE
      let i = dropIndex + 1;
      for (; i < sourceItems.length; i++) {
        if (sourceItems[i].level <= drop.level) {
          break;
        }
      }
      newList.splice(i, 0, ...activeList);
    }
    newList.forEach((item, index) => {
      item.index = index;
    });
    setSourceItems(newList);
  };

  const addItemChild = (item: T) => () => {
    const id = uuid();
    const newItem = {
      id: id,
      title: id.slice(0, 4),
      index: 0,
      level: item.level + 1,
      isOpen: true,
    } as T;
    let insertIndex = item.index + 1;
    for (; insertIndex < sourceItems.length; insertIndex++) {
      if (sourceItems[insertIndex].level <= item.level) {
        break;
      }
    }
    const newItems = [...sourceItems];
    newItems.splice(insertIndex, 0, newItem);
    newItems.forEach((item, index) => {
      item.index = index;
    });
    setSourceItems(newItems);
  };
  const deleteItem = (item: T) => () => {
    const newItems = [...sourceItems];
    let count = 1;
    for (let i = item.index + 1; i < sourceItems.length; i++) {
      if (sourceItems[i].level <= item.level) {
        break;
      } else {
        count += 1;
      }
    }
    newItems.splice(item.index, count);
    newItems.forEach((item, index) => {
      item.index = index;
    });
    setSourceItems(newItems);
  };
  const updateItem = (item: T) => (newItem: T) => {
    const newItems = [...sourceItems];
    newItems[item.index] = newItem;
    setSourceItems(newItems);
  };
  return (
    <ul className={cn("space-y-1 w-full", className)}>
      {targetItems.map((item) => (
        <li
          key={item.id}
          id={item.id}
          draggable
          onDragStart={handleDragStart(item)}
          onDragEnd={handleDragEnd(item)}
          onDragOver={handleDragOver(item)}
          onDrop={handleDrop(item)}
        >
          {item.id === over?.id && abovePart === AbovePart.ABOVE && (
            <div
              className="h-1 w-auto m-auto bg-blue-500 transform transition-transform duration-300 ease-in-out mb-1"
              style={{ marginLeft: `${targetLevel * paddingLeft}px` }}
            ></div>
          )}
          <DraggableTreeItem
            item={item}
            addItemChild={addItemChild(item)}
            deleteItem={deleteItem(item)}
            updateItem={updateItem(item)}
            className={cn(
              item.id === over?.id &&
                item.id !== activate?.id &&
                abovePart === AbovePart.MIDDLE &&
                "bg-blue-500"
            )}
            style={{
              marginLeft: `${item.level * paddingLeft}px`,
            }}
          >
            {item.title || "无标题"}
          </DraggableTreeItem>

          {item.id === over?.id && abovePart === AbovePart.BELOW && (
            <div
              className="h-1 w-auto m-auto bg-blue-500 dark:bg-yellow-500 transform transition-transform duration-300 ease-in-out mt-1"
              style={{ marginLeft: `${targetLevel * paddingLeft}px` }}
            ></div>
          )}
        </li>
      ))}
    </ul>
  );
}
