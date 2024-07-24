"use client";
import React, { forwardRef } from "react";

import { Action, ActionProps } from "./Action";
import { X } from "lucide-react";

export const Delete = forwardRef<HTMLButtonElement, ActionProps>(
  (props, ref) => {
    return (
      <Action ref={ref} {...props}>
        <X className="w-auto h-auto bg-transparent" />
      </Action>
    );
  }
);

Delete.displayName = "Delete";
