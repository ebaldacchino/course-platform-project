"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import type { Lesson, Section } from "../lessons.types";
import { LessonForm } from "./LessonForm";

export interface LessonFormDialogProps {
  sections: Section[];
  children: ReactNode;
  defaultSectionId?: string;
  lesson?: Lesson;
}

export function LessonFormDialog(props: LessonFormDialogProps) {
  const { children, sections, defaultSectionId, lesson } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!lesson ? "New Lesson" : `Edit ${lesson.name}`}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <LessonForm
            sections={sections}
            onSuccess={() => setIsOpen(false)}
            lesson={lesson}
            defaultSectionId={defaultSectionId}
          />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
