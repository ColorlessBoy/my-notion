"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultBlockSpecs,
  filterSuggestionItems,
  insertOrUpdateBlock,
  PartialBlock,
} from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import "./style.css";
import { FollowCodeBlockForNote } from "./FollowCodeBlockForNote";
import { FollowIcon } from "../FollowIcon";
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from "@blocknote/react";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    // Adds all default blocks.
    ...defaultBlockSpecs,
    // Adds the Alert block.
    follow: FollowCodeBlockForNote,
  },
});
// Slash menu item to insert an Alert block
const insertFollowCodeBlock = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Follow",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "follow",
    });
  },
  aliases: ["follow"],
  group: "Other",
  icon: <FollowIcon />,
  subtext: "Insert a follow code block.",
});

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
    if (blocks && blocks.length > 0) {
      console.log(blocks.map((b) => b.content));
      return BlockNoteEditor.create({ initialContent: blocks, schema });
    } else {
      return BlockNoteEditor.create({ schema });
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
          //@ts-ignore
          updateContent(editor.document);
        }}
        theme={"light"}
        style={{
          display: "flex",
        }}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            // Gets all default slash menu items and `insertAlert` item.
            filterSuggestionItems(
              [
                ...getDefaultReactSlashMenuItems(editor),
                insertFollowCodeBlock(editor),
              ],
              query
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}
