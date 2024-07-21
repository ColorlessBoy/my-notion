"use client";
import {
  forwardRef,
  HTMLAttributes,
  KeyboardEventHandler,
  MouseEventHandler,
  useState,
} from "react";

import styles from "./TreeItem.module.css";
import { cn } from "@/lib/utils";
import { Handle } from "./Handle";
import { Delete } from "./Delete";
import { Collapse } from "./Collapse";
import { Create } from "./Create";
import { Loader2 } from "lucide-react";

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, "id"> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  wrapperRef?(node: HTMLLIElement): void;

  isSavingItems?: boolean;

  onCollapse?(): void;
  onCreateNewChild?(): void;
  onDelete?(): void;

  onUpdateTitle?(newTitle: string): void;
  onSaveTitle?(): void;

  draggable?: boolean;
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,

      isSavingItems,
      onCollapse,
      onCreateNewChild,
      onDelete,
      onUpdateTitle,
      onSaveTitle,
      draggable,

      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    const [showTools, setShowTools] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleDoubleClick = () => {
      if (onUpdateTitle) {
        setIsEditing(true);
      }
    };

    const handleBlur = () => {
      if (onUpdateTitle) {
        setIsEditing(false);
        onSaveTitle && onSaveTitle();
      }
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (onUpdateTitle && event.key === "Enter") {
        event.preventDefault();
        setIsEditing(false);
        onSaveTitle && onSaveTitle();
      }
    };

    return (
      <li
        className={cn(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
        onMouseEnter={() => setShowTools(true)}
        onMouseLeave={() => {
          setShowTools(false);
        }}
      >
        <div className={cn(styles.TreeItem)} ref={ref} style={style}>
          {!clone && onCollapse && (
            <Collapse
              onClick={onCollapse}
              collapsed={collapsed}
              className={cn(ghost && "opacity-0 h-0")}
            />
          )}
          {!clone && isEditing ? (
            <input
              className={cn(styles.Input, "px-2 w-full")}
              value={value}
              onChange={(e) => onUpdateTitle && onUpdateTitle(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span onDoubleClick={handleDoubleClick} className={cn(styles.Text)}>
              {value || "无标题"}
            </span>
          )}
          {!clone && onDelete && (
            <Delete onClick={onDelete} showTool={showTools && !isEditing} />
          )}
          {!clone && onCreateNewChild && (
            <Create
              onClick={onCreateNewChild}
              showTool={showTools && !isEditing}
            />
          )}
          {!clone && draggable && (
            <Handle {...handleProps} showTool={showTools && !isEditing} />
          )}
          {clone && childCount && childCount > 1 ? (
            <span className={cn(styles.Count)}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);
