"use client";

import { SpacesContext } from "@/providers/SpacesProvider";
import { useContext } from "react";
import SpaceCard, { SpaceCardEditableContent } from "./SpaceCard";
import { stringToColor } from "@/lib/utils";
import { Loader2, PlusIcon } from "lucide-react";

export default function SpaceCards() {
  const spacesContext = useContext(SpacesContext);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
      {spacesContext?.spaces
        .filter((space) => space.isDeleted !== true)
        .map((space) => {
          return (
            <SpaceCard
              key={space.id}
              backgroundColor={stringToColor(space.title)}
              onDelete={() => {
                spacesContext.moveToTrash(space.id);
              }}
            >
              <SpaceCardEditableContent
                value={space.title}
                onChange={(value: string) => {
                  spacesContext.updateSpace(space.id, value);
                }}
              />
            </SpaceCard>
          );
        })}
      <SpaceCard
        onClick={() => {
          spacesContext?.createSpace();
        }}
      >
        {spacesContext === undefined ||
        spacesContext?.isPending === true ||
        spacesContext?.isInit === true ? (
          <Loader2 className="w-10 h-10 text-gray-500  animate-spin" />
        ) : (
          <PlusIcon className="w-10 h-10 text-gray-500" />
        )}
      </SpaceCard>
    </div>
  );
}
