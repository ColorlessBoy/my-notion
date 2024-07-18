"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { forwardRef, CSSProperties } from "react";

export interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
  showTool?: boolean;
  className?: string;
}

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ showTool = true, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        {...props}
        className={cn(
          "rounded-sm w-6 h-6 p-0 m-0 border-none bg-transparent hover:bg-gray-300",
          "transition-transform ease-in-out duration-300",
          showTool === false && "w-0 h-0",
          className
        )}
        tabIndex={0}
        variant="outline"
      />
    );
  }
);
