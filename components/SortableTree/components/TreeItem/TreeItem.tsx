import React, { forwardRef, HTMLAttributes } from "react";

import styles from "./TreeItem.module.css";
import { cn } from "@/lib/utils";
import { Handle } from "./Handle";
import { Delete } from "./Delete";
import { Collapse } from "./Collapse";
import { UniqueIdentifier } from "@dnd-kit/core";

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
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
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
      >
        <div className={cn(styles.TreeItem)} ref={ref} style={style}>
          <Handle {...handleProps} />
          {onCollapse && (
            <Collapse
              onClick={() => {
                onCollapse();
                console.log("collapse", collapsed);
              }}
              collapsed={collapsed}
              className={cn(ghost && "opacity-0 h-0")}
            />
          )}
          <span className={cn(styles.Text)}>{value}</span>
          {!clone && onRemove && <Delete onClick={onRemove} />}
          {clone && childCount && childCount > 1 ? (
            <span className={cn(styles.Count)}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);
