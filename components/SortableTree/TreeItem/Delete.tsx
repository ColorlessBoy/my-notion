"use client";
import React, { forwardRef } from "react";

import { Action, ActionProps } from "./Action";
import { Trash2 } from "lucide-react";

export const Delete = forwardRef<HTMLButtonElement, ActionProps>(
  (props, ref) => {
    return (
      <Action ref={ref} {...props}>
        <Trash2 className="w-auto h-auto bg-transparent" />
      </Action>
    );
  }
);
