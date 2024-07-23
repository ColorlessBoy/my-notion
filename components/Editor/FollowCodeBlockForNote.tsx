"use client";
import { createReactBlockSpec } from "@blocknote/react";
import { FollowCodeBlock } from "./FollowCodeBlock/block";

export const FollowCodeBlockForNote = createReactBlockSpec(
  {
    type: "follow",
    propSchema: {
      data: {
        // @ts-ignore
        code: "",
      },
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      const updateContent = (val: string) => {
        editor.updateBlock(block, {
          //@ts-ignore
          props: { ...block.props, data: { code: val } },
        });
      };
      return (
        <FollowCodeBlock
          blockId={block.id}
          // @ts-ignore
          content={block?.props?.data?.code || ""}
          updateContent={updateContent}
        />
      );
    },
    toExternalHTML: ({ block }) => {
      //@ts-ignore
      const code = block?.props?.data?.code;
      return (
        <pre>
          <code>{code || ""}</code>
        </pre>
      );
    },
  }
);
