"use server";
import { prisma } from "./prisma";

function log(name: string, obj: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[db][tableOfContent][${name}]`, obj);
  }
}
function logError(name: string, error: any) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[db][tableOfContent][${name}]`, error);
  }
}
export async function $getAll(spaceId: string) {
  try {
    log("$getAll", { spaceId });
    const tocs = prisma.tableOfContent.findMany({
      where: { spaceId },
      orderBy: { createdAt: "asc" },
    });
    return tocs;
  } catch (error) {
    logError("$getAll", error);
  }
  return [];
}

export async function $getLatest(spaceId: string) {
  try {
    log("$getLatest", { spaceId });
    const toc = prisma.tableOfContent.findFirst({
      where: { spaceId },
      orderBy: { createdAt: "desc" },
    });
    return toc;
  } catch (error) {
    logError("$getLatest", error);
  }
  return null;
}

export async function $create(spaceId: string, content?: string) {
  try {
    log("$create", { spaceId, content });
    const toc = await prisma.tableOfContent.create({
      data: {
        spaceId,
        content,
      },
    });
    return toc;
  } catch (error) {
    logError("$create", error);
  }
  return null;
}

export async function $delete(id: string) {
  try {
    log("$delete", { id });
    const toc = await prisma.tableOfContent.delete({ where: { id } });
    return toc;
  } catch (error) {
    logError("$delete", error);
  }
  return null;
}

export async function $update(id: string, content: string) {
  try {
    log("$update", { id, content });
    const toc = await prisma.tableOfContent.update({
      where: { id },
      data: { content },
    });
    return toc;
  } catch (error) {
    logError("$update", error);
  }
  return null;
}
