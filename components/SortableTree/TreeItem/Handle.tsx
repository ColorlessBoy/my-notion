"use client";
import React, { forwardRef } from "react";

import { Action, ActionProps } from "./Action";
import { GripVertical } from "lucide-react";

export const Handle = forwardRef<HTMLButtonElement, ActionProps>(
  (props, ref) => {
    return (
      <Action ref={ref} className="cursor-grab" {...props}>
        <GripVertical className="w-auto h-auto bg-transparent text-gray-400" />
      </Action>
    );
  }
);

Handle.displayName = "Handle";
