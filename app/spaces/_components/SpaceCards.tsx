"use client";

import { SpacesContext } from "@/components/providers/SpacesProvider";
import { useContext } from "react";
import SpaceCard, { SpaceCardEditableContent } from "./SpaceCard";
import { stringToColor } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SPACE_URL } from "@/routes";
import { Space } from "@prisma/client";

export default function SpaceCards() {
  const spacesContext = useContext(SpacesContext);

  const router = useRouter();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-5">
      {spacesContext?.spaces
        .filter((space) => space.isDeleted !== true)
        .map((space) => {
          return (
            <SpaceCard
              space={space}
              key={space.id}
              backgroundColor={stringToColor(space.title)}
              onMoveToTrash={() => {
                return spacesContext.updateSpace(
                  space,
                  undefined,
                  undefined,
                  true
                );
              }}
              onUpdateTitle={(newTitle: string) => {
                return spacesContext.updateSpace(space, newTitle);
              }}
              onSave={async (space: Space) => {
                await spacesContext.saveSpace(space);
              }}
              onChangeRoute={() => {
                router.push(`${SPACE_URL}/${space.id}`);
              }}
            />
          );
        })}
      <SpaceCard onCreate={spacesContext?.createSpace} isAddCard />
    </div>
  );
}
