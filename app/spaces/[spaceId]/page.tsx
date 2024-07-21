"use client";

import { TableOfContent } from "@prisma/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import * as db from "@/db";

export default function SpaceIdPage() {
  const { spaceId } = useParams<{ spaceId?: string }>();
  const [contentList, setContentList] = useState<TableOfContent[]>([]);

  useEffect(() => {
    if (spaceId) {
      db.tableOfContent.$getAll(spaceId).then((contentList) => {
        setContentList(contentList);
      });
    }
  }, []);

  return (
    <>
      <div>Space Id Page {spaceId}</div>
      {contentList.map((content) => (
        <pre key={content.id}>
          <code>{content.content}</code>
        </pre>
      ))}
    </>
  );
}
