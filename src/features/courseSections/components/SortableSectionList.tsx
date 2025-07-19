"use client";

import { ActionButton } from "@/components/ActionButton";
import { SortableItem, SortableList } from "@/components/SortableList";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EyeClosed, Trash2Icon } from "lucide-react";
import { deleteSection, updateSectionOrders } from "../sections.actions";
import type { Section } from "../sections.types";
import { SectionFormDialog } from "./SectionFormDialog";

export interface SortableSectionListProps {
  courseId: string;
  sections: Section[];
}

export function SortableSectionList(props: SortableSectionListProps) {
  const { courseId, sections } = props;
  return (
    <SortableList items={sections} onOrderChange={updateSectionOrders}>
      {(items) =>
        items.map((section) => (
          <SortableItem
            key={section.id}
            id={section.id}
            className="flex items-center gap-1"
          >
            <div
              className={cn(
                "contents",
                section.status === "private" && "text-muted-foreground"
              )}
            >
              {section.status === "private" && <EyeClosed className="size-4" />}
              {section.name}
            </div>
            <SectionFormDialog section={section} courseId={courseId}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Edit
                </Button>
              </DialogTrigger>
            </SectionFormDialog>
            <ActionButton
              action={deleteSection.bind(null, section.id)}
              requireAreYouSure
              variant="destructive"
              size="sm"
            >
              <Trash2Icon />
              <span className="sr-only">Delete</span>
            </ActionButton>
          </SortableItem>
        ))
      }
    </SortableList>
  );
}
