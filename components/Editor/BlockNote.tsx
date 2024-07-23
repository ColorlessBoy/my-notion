"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import "./style.css";

// Our <Editor> component we can reuse later
export default function BlockNote({
  content,
  setContent,
}: {
  content?: string | null;
  setContent?: (newContent: string) => void;
}) {
  const editor = useMemo(() => {
    const blocks = content ? (JSON.parse(content) as PartialBlock[]) : [];
    if (blocks) {
      console.log("block note 初始化");
      return BlockNoteEditor.create({ initialContent: blocks });
    } else {
      return BlockNoteEditor.create();
    }
  }, []);

  const updateContent = useCallback(
    debounce((newBlocks: PartialBlock[]) => {
      setContent && setContent(JSON.stringify(newBlocks));
    }, 1000),
    []
  );

  if (editor === undefined) {
    return "加载中...";
  }

  // Renders the editor instance using a React component.
  return (
    <div className="flex w-full min-h-full">
      <BlockNoteView
        editor={editor}
        onChange={() => {
          updateContent(editor.document);
        }}
        theme={"light"}
        style={{
          display: "flex",
        }}
      />
    </div>
  );
}
