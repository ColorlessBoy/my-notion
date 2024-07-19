"use client";
import { useContext, useState } from "react";
import { FollowHead } from "../FollowIcon";
import { SpacesContext } from "@/providers/SpacesProvider";
import { SidebarSpaceCard, SidebarSpaceCardSkeleton } from "./SidebarSpaceCard";
import { Button } from "../ui/button";
import Link from "next/link";
import { SPACE_URL } from "@/routes";
import { Plus, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { cn, vibrantColors } from "@/lib/utils";

export function SidebarContent() {
  return (
    <>
      <FollowHead className="flex justify-center items-center my-10" />
      <SpaceShelfButton />
      <SpaceList />
      <CreateNewSpaceButton />
      <SpaceTrashContent />
    </>
  );
}

export function SpaceShelfButton() {
  return (
    <Button
      asChild
      variant="link"
      className="text-xl m-2 border-y-2 w-auto flex items-center justify-center"
    >
      <Link href={SPACE_URL}>书架</Link>
    </Button>
  );
}

export function CreateNewSpaceButton() {
  const spacesContext = useContext(SpacesContext);
  return (
    <div
      role="button"
      onClick={() => spacesContext?.createSpace()}
      className={cn(
        "flex items-center pr-1 gap-x-1 hover:bg-gray-200 flex-nowrap rounded-sm text-gray-500 my-4"
      )}
    >
      <Plus className="w-7 h-7 bg-transparent" />
      <span className="font-medium text-lg text-nowrap flex-1 bg-transparent">
        新建书籍
      </span>
    </div>
  );
}

export function SpaceList() {
  const spacesContext = useContext(SpacesContext);
  if (spacesContext === undefined || spacesContext?.isInit) {
    return (
      <>
        <SidebarSpaceCardSkeleton />;
        <SidebarSpaceCardSkeleton />;
        <SidebarSpaceCardSkeleton />;
      </>
    );
  }
  return spacesContext.spaces
    .filter((space) => space.isDeleted !== true)
    .map((space) => {
      return (
        <SidebarSpaceCard
          key={space.id}
          space={space}
          isActive={spacesContext?.choosedSpace?.id === space.id}
          onTrash={() => {
            spacesContext.moveToTrash(space.id);
          }}
          onChange={(newTitle: string) => {
            spacesContext?.updateSpace(space.id, newTitle);
          }}
        />
      );
    });
}

export function SpaceTrashContent() {
  const spacesContext = useContext(SpacesContext);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="space-trash">
        <AccordionTrigger>
          <div className="flex space-x-1 items-center flex-nowrap">
            <Trash2 className="w-7 h-7" />
            <span className="font-medium text-lg text-nowrap">回收站</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {spacesContext?.spaces
            .filter((space) => space.isDeleted === true)
            .map((space) => {
              return (
                <SidebarSpaceCard
                  key={space.id}
                  space={space}
                  isActive={false}
                  className="pl-2"
                  onDelete={() => {
                    spacesContext.deleteSpace(space.id);
                  }}
                  onRecover={() => {
                    spacesContext.recoverFromTrash(space.id);
                  }}
                />
              );
            })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
