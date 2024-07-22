"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function SpaceIdPage() {
  const { spaceId, noteId } = useParams<{
    spaceId?: string;
    noteId?: string;
  }>();

  return (
    <>
      <div>Note Id Page {noteId}</div>
    </>
  );
}
