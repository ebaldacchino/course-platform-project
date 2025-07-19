"use client";

import { ActionButton } from "@/components/ActionButton";
import { SortableItem, SortableList } from "@/components/SortableList";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { EyeClosed, Trash2Icon, VideoIcon } from "lucide-react";
import type { Lesson, Section } from "../lessons.types";
import { LessonFormDialog } from "./LessonFormDialog";
// import { deleteLesson, updateLessonOrders } from "../actions/lessons";

async function updateLessonOrders(
  newOrder: string[]
): Promise<{ error: boolean; message: string }> {
  return { error: false, message: "Lesson order updated successfully" };
}

async function deleteLesson(
  id: string
): Promise<{ error: boolean; message: string }> {
  return { error: false, message: "Lesson deleted successfully" };
}

interface SortableLessonListProps {
  sections: Section[];
  lessons: Lesson[];
}

export function SortableLessonList(props: SortableLessonListProps) {
  const { sections, lessons } = props;
  return (
    <SortableList items={lessons} onOrderChange={updateLessonOrders}>
      {(items) =>
        items.map((lesson) => (
          <SortableItem
            key={lesson.id}
            id={lesson.id}
            className="flex items-center gap-1"
          >
            <div
              className={cn(
                "contents",
                lesson.status === "private" && "text-muted-foreground"
              )}
            >
              {lesson.status === "private" && <EyeClosed className="size-4" />}
              {lesson.status === "preview" && <VideoIcon className="size-4" />}
              {lesson.name}
            </div>
            <LessonFormDialog lesson={lesson} sections={sections}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Edit
                </Button>
              </DialogTrigger>
            </LessonFormDialog>
            <ActionButton
              action={deleteLesson.bind(null, lesson.id)}
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
