import { CNode, CNodeTypes, ThmCNode } from "@/lib/follow-parser";
import { useEffect, useState } from "react";

interface ProofStateBlockProps {
  cNodes: CNode[];
  textareaRow: number;
  textareaCol: number;
}

export function ProofStateBlock({
  cNodes,
  textareaRow,
  textareaCol,
}: ProofStateBlockProps) {
  const [thmCNode, setThmCNode] = useState<ThmCNode | undefined>(undefined);
  const [proofState, setProofState] = useState<string>("");
  const [targetState, setTargetState] = useState<string>("");

  useEffect(() => {
    const cNode = cNodes.find(
      (c) =>
        c.cnodetype === CNodeTypes.THM &&
        c.astNode.range.start.line <= textareaRow &&
        c.astNode.range.end.line >= textareaRow
    );
    setThmCNode(cNode as ThmCNode);
  }, [cNodes, textareaRow]);

  useEffect(() => {
    if (thmCNode) {
      const proofIndex = thmCNode.proofs.findIndex(
        (proof) =>
          proof.range.start.line <= textareaRow &&
          proof.range.end.line >= textareaRow
      );

      if (proofIndex !== -1) {
        const proof = thmCNode.proofs[proofIndex];
        const process = thmCNode.proofProcess[proofIndex];
        setTargetState(
          process.map((t) => "|-" + t.termContent).join("\n") || "Q.E.D"
        );

        const proofState = [
          `thm ${proof.root.content}(${proof.children
            .map((t) => t.termContent)
            .join(", ")}) {`,
          ...proof.targets.map((t) => "|- " + t.termContent),
          ...proof.assumptions.map((a) => "-| " + a.termContent),
        ];
        if (proof.diffError && proof.diffError.length > 0) {
          proofState.push("diff " + proof.diffError.join(" "));
        }
        proofState.push("}");
        setProofState(proofState.join("\n"));
      }
    }
  }, [thmCNode, textareaRow]);

  return (
    <>
      {thmCNode &&
        thmCNode.proofs.map(
          (proof, index) =>
            proof.range.start.line <= textareaRow &&
            proof.range.end.line >= textareaRow && (
              <div key={index} className="flex w-full space-x-2 m-2">
                <div className="w-auto max-w-[50%] border-solid border-black dark:border-gray-400 border-2 p-2 rounded-sm">
                  <h2 className="font-bold">当前证明操作</h2>
                  <pre>
                    <code>{proofState}</code>
                  </pre>
                </div>
                <div className="w-auto max-w-[50%] border-solid border-black dark:border-gray-400 border-2 p-2 rounded-sm">
                  <h2 className="font-bold">新目标</h2>
                  <pre>
                    <code>{targetState}</code>
                  </pre>
                </div>
              </div>
            )
        )}
    </>
  );
}
