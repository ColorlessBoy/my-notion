import React, { forwardRef } from "react";

import { Action, ActionProps } from "./Action";
import { ChevronRight, GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapseProps extends ActionProps {
  collapsed?: boolean;
}

export const Collapse = forwardRef<HTMLButtonElement, CollapseProps>(
  ({ collapsed, ...props }, ref) => {
    return (
      <Action ref={ref} {...props}>
        <ChevronRight
          className={cn(
            "transition-transform ease-in-out duration-100 w-auto h-auto",
            collapsed === false ? "rotate-90" : "rotate-0"
          )}
        />
      </Action>
    );
  }
);
