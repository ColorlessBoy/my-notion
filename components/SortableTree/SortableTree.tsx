"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragEndEvent,
  DragOverEvent,
  MeasuringStrategy,
  DropAnimation,
  Modifier,
  defaultDropAnimation,
  UniqueIdentifier,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeItem,
  removeChildrenOf,
  setProperty,
  createNewChild,
} from "./utilities";
import type { FlattenedItem, SensorContext, TreeItem } from "./types";
import { sortableTreeKeyboardCoordinates } from "./keyboardCoordinates";
import { CSS } from "@dnd-kit/utilities";
import { SortableTreeItem } from "./TreeItem";
import { debounce } from "lodash";

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

interface Props {
  items: TreeItem[];
  setItems: (items: TreeItem[]) => void;
  collapsible?: boolean;
  deletable?: boolean;
  editable?: boolean;
  draggable?: boolean;
  creatable?: boolean;
  indicator?: boolean;
  indentationWidth?: number;

  onCreateChild?: () => Promise<TreeItem | undefined>;
  onUpdateTitle?: (id: UniqueIdentifier, newTitle: string) => void;

  onSaveItems?: (items: TreeItem[]) => Promise<void>;
  onSaveItem?: (item: TreeItem) => void;

  onChangeRoute?: (id: UniqueIdentifier) => void;

  selectedId?: UniqueIdentifier;
}

export function SortableTree({
  items,
  setItems,
  collapsible,
  deletable,
  editable,
  draggable,
  creatable,
  indicator = false,
  indentationWidth = 16,
  onCreateChild,
  onUpdateTitle,
  onSaveItems,
  onSaveItem,
  onChangeRoute,

  selectedId,
}: Props) {
  const [isMounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const internalOnSaveItems = useCallback(
    debounce(async (items: TreeItem[]) => {
      if (onSaveItems) {
        setIsSaving(true);
        await onSaveItems(items);
        setIsSaving(false);
      }
    }, 300),
    []
  );
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems
    );
  }, [activeId, items]);
  const projected =
    activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth
        )
      : null;
  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth)
  );
  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems]
  );
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  if (!isMounted) {
    return null;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map((item) => (
          <SortableTreeItem
            key={item.id}
            id={item.id}
            value={item.title}
            depth={
              item.id === activeId && projected ? projected.depth : item.depth
            }
            indentationWidth={indentationWidth}
            indicator={indicator}
            collapsed={item.collapsed}
            isSavingItems={isSaving}
            onCollapse={collapsible ? () => handleCollapse(item.id) : undefined}
            onCreateNewChild={
              creatable ? () => handleCreateNewChild(item.id) : undefined
            }
            onDelete={deletable ? () => handleDelete(item.id) : undefined}
            onUpdateTitle={
              editable
                ? (newTitle: string) => handleUpdateTitle(item.id, newTitle)
                : undefined
            }
            onSaveTitle={() => handleSaveTitle(item)}
            draggable={draggable}
            isActive={selectedId === item.id}
            onChangeRoute={
              onChangeRoute
                ? () => {
                    onChangeRoute(item.id);
                  }
                : undefined
            }
          />
        ))}
        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimationConfig}
            modifiers={indicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <SortableTreeItem
                id={activeId}
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                value={activeItem.title}
                indentationWidth={indentationWidth}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty("cursor", "grabbing");
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];

      clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);
      setItems(newItems);
      internalOnSaveItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty("cursor", "");
  }

  function handleCollapse(id: UniqueIdentifier) {
    if (collapsible) {
      const newItems = setProperty(items, id, "collapsed", (value) => !value);
      setItems(newItems);
      internalOnSaveItems(newItems);
    }
  }

  async function handleCreateNewChild(id: UniqueIdentifier) {
    if (onCreateChild) {
      setIsSaving(true);
      const dbNewItem = await onCreateChild();
      const newItems = createNewChild(items, id, dbNewItem);
      setItems(newItems);
      await internalOnSaveItems(newItems);
      setIsSaving(false);
    }
  }

  function handleDelete(id: UniqueIdentifier) {
    if (deletable) {
      const newItems = removeItem(items, id);
      setItems(newItems);
      internalOnSaveItems(newItems);
    }
  }

  function handleUpdateTitle(id: UniqueIdentifier, title: string) {
    if (onUpdateTitle) {
      onUpdateTitle(id, title);
      const newItems = setProperty(items, id, "title", () => title);
      setItems(newItems);
    }
  }

  function handleSaveTitle(item: TreeItem) {
    if (onSaveItem) {
      onSaveItem(item);
      internalOnSaveItems(items);
    }
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
