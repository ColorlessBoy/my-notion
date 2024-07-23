import { CompilerForWeb } from "./follow-parser";

type SpaceId = string;
type NoteId = string;
type BlockId = string;
declare global {
  var compilerMap: Map<SpaceId, CompilerForWeb> | undefined;
}

export const compilerMap =
  global.compilerMap || new Map<SpaceId, CompilerForWeb>();

if (process.env.NODE_ENV === "development") global.compilerMap = compilerMap;

export function getCompiler(spaceId: SpaceId) {
  let compiler = compilerMap.get(spaceId);
  if (compiler === undefined) {
    compiler = new CompilerForWeb();
    compilerMap.set(spaceId, compiler);
  }
  return compiler;
}

export function deletNoteOfCompiler(spaceId?: SpaceId, noteId?: NoteId) {
  if (spaceId && noteId) {
    const compiler = compilerMap.get(spaceId);
    compiler?.compilerMap.delete(noteId);
  }
}

export function deleteBlockOfCompiler(
  spaceId?: SpaceId,
  noteId?: NoteId,
  blockId?: BlockId
) {
  if (spaceId && noteId && blockId) {
    const compiler = compilerMap.get(spaceId);
    compiler?.compilerMap.get(noteId)?.delete(blockId);
  }
}
