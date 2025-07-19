"use client";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import type { Section } from "../sections.types";
import { SectionForm } from "./SectionForm";

interface SectionFormDialogProps {
  courseId: string;
  children: ReactNode;
  section?: Section;
}

export function SectionFormDialog(props: SectionFormDialogProps) {
  const { courseId, children, section } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {!section ? "New Section" : `Edit ${section.name}`}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <SectionForm
            section={section}
            courseId={courseId}
            onSuccess={() => setIsOpen(false)}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
