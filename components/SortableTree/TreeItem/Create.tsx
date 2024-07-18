"use client";
import React, { forwardRef } from "react";

import { Action, ActionProps } from "./Action";
import { Plus } from "lucide-react";

export const Create = forwardRef<HTMLButtonElement, ActionProps>(
  (props, ref) => {
    return (
      <Action ref={ref} {...props}>
        <Plus className="w-auto h-auto bg-transparent" />
      </Action>
    );
  }
);
