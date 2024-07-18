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
import { UniqueIdentifier } from "@dnd-kit/core";
import { Create } from "./Create";

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
  value: UniqueIdentifier;
  onCollapse?(): void;
  onChangeTitle?(newTitle: string): void;
  onCreate?(): void;
  onRemove?(): void;
  wrapperRef?(node: HTMLLIElement): void;
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
      onCollapse,
      onCreate,
      onChangeTitle,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    const [showTools, setShowTools] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState<string>(value.toString());

    const handleDoubleClick = () => {
      if (onChangeTitle) {
        setIsEditing(true);
      }
    };

    const handleBlur = () => {
      if (onChangeTitle) {
        onChangeTitle(title);
        setIsEditing(false);
      }
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
      if (onChangeTitle && event.key === "Enter") {
        event.preventDefault();
        onChangeTitle(title);
        setIsEditing(false);
      }
    };

    const handleLongPress: MouseEventHandler<HTMLDivElement> = (event) => {
      if (onChangeTitle) {
        event.preventDefault();
        setIsEditing(true);
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
        <div
          className={cn(styles.TreeItem)}
          ref={ref}
          style={style}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleLongPress}
        >
          {onCollapse && (
            <Collapse
              onClick={onCollapse}
              collapsed={collapsed}
              className={cn(ghost && "opacity-0 h-0")}
            />
          )}
          {isEditing ? (
            <input
              className={cn(styles.Input, "px-2 w-full")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span className={cn(styles.Text)}>{value}</span>
          )}
          {!clone && onRemove && (
            <Delete onClick={onRemove} showTool={showTools && !isEditing} />
          )}
          {!clone && onCreate && (
            <Create
              onClick={() => {
                console.log("click onCreate");
                onCreate();
              }}
              showTool={showTools && !isEditing}
            />
          )}
          {!clone && (
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
