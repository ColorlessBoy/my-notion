"use server";
import { prisma } from "./prisma";

function log(name: string, obj: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[db][space][${name}]`, obj);
  }
}
function logError(name: string, error: any) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[db][space][${name}]`, error);
  }
}
export async function $getAll(userId: string) {
  try {
    log("$getAll", { userId });
    const spaces = prisma.space.findMany({
      orderBy: { createdAt: "asc" },
    });
    return spaces;
  } catch (error) {
    logError("$getAll", error);
  }
  return [];
}

export async function $create(
  userId: string,
  title?: string,
  content?: string
) {
  try {
    log("$create", { userId, title });
    const space = await prisma.space.create({
      data: {
        title,
        content,
      },
    });
    return space;
  } catch (error) {
    logError("$create", error);
  }
  return null;
}

export async function $delete(id: string) {
  try {
    log("$delete", { id });
    const space = await prisma.space.delete({ where: { id } });
    return space;
  } catch (error) {
    logError("$delete", error);
  }
  return null;
}

export async function $update(
  id: string,
  title?: string | null,
  content?: string | null,
  isDeleted?: boolean | null
) {
  try {
    log("$update", { id, title, content, isDeleted });
    let data = {};
    if (title !== null && title !== undefined) {
      data = { ...data, title };
    }
    if (content !== null && content !== undefined) {
      data = { ...data, content };
    }
    if (isDeleted !== null && isDeleted !== undefined) {
      data = { ...data, isDeleted };
    }

    const space = await prisma.space.update({
      where: { id },
      data: data,
    });
    return space;
  } catch (error) {
    logError("$update", error);
  }
  return null;
}
