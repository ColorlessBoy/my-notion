import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { forwardRef, CSSProperties } from "react";

export interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        {...props}
        className={cn(
          "rounded-sm w-6 h-6 p-0 m-1 border-none bg-transparent hover:bg-gray-300",
          className
        )}
        tabIndex={0}
        variant="outline"
      />
    );
  }
);
