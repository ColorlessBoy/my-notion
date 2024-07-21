"use server";
import { prisma } from "./prisma";

function log(name: string, obj: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[db][note][${name}]`, obj);
  }
}
function logError(name: string, error: any) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[db][note][${name}]`, error);
  }
}
export async function $getAll(spaceId: string) {
  try {
    log("$getAll", { spaceId });
    const notes = prisma.note.findMany({
      where: { spaceId },
      orderBy: { createdAt: "asc" },
    });
    return notes;
  } catch (error) {
    logError("$getAll", error);
  }
  return [];
}

export async function $get(id: string) {
  try {
    log("$get", { id });
    const note = await prisma.note.findUnique({
      where: { id },
    });
    return note;
  } catch (error) {
    logError("$get", error);
  }
  return null;
}

export async function $create(
  spaceId: string,
  title?: string,
  content?: string
) {
  try {
    log("$create", { spaceId, title });
    const note = await prisma.note.create({
      data: {
        spaceId,
        title,
        content,
      },
    });
    return note;
  } catch (error) {
    logError("$create", error);
  }
  return null;
}

export async function $delete(id: string) {
  try {
    log("$delete", { id });
    const note = await prisma.note.delete({ where: { id } });
    return note;
  } catch (error) {
    logError("$delete", error);
  }
  return null;
}

export async function $update(
  id: string,
  title?: string | null,
  content?: string | null
) {
  try {
    log("$update", { id, title, content });
    let data = {};
    if (title !== null && title !== undefined) {
      data = { ...data, title };
    }
    if (content !== null && content !== undefined) {
      data = { ...data, content };
    }

    const note = await prisma.note.update({
      where: { id },
      data: data,
    });
    return note;
  } catch (error) {
    logError("$update", error);
  }
  return null;
}
