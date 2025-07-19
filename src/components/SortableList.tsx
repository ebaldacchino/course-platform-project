"use client";

import { actionToast } from "@/hooks/actionToast";
import { cn } from "@/lib/utils";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { type ReactNode, useId, useOptimistic, useTransition } from "react";

export interface SortableListProps<T extends { id: string }> {
  items: T[];
  onOrderChange: (
    newOrder: string[]
  ) => Promise<{ error: boolean; message: string }>;
  children: (items: T[]) => ReactNode;
}

export function SortableList<T extends { id: string }>(
  props: SortableListProps<T>
) {
  const { items, onOrderChange, children } = props;
  const dndContextId = useId();
  const [optimisticItems, setOptimisticItems] = useOptimistic(items);
  const [, startTransition] = useTransition();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeId = active.id.toString();
    const overId = over?.id.toString();
    const orderHasntChanged = activeId === overId;

    if (orderHasntChanged || !overId || !activeId) return;

    function getNewArray(array: T[], activeId: string, overId: string) {
      const oldIndex = array.findIndex((section) => section.id === activeId);
      const newIndex = array.findIndex((section) => section.id === overId);
      return arrayMove(array, oldIndex, newIndex);
    }

    startTransition(async () => {
      setOptimisticItems((items) => getNewArray(items, activeId, overId));
      const actionData = await onOrderChange(
        getNewArray(optimisticItems, activeId, overId).map((s) => s.id)
      );

      actionToast(actionData);
    });
  }

  return (
    <DndContext id={dndContextId} onDragEnd={handleDragEnd}>
      <SortableContext
        items={optimisticItems}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col">{children(optimisticItems)}</div>
      </SortableContext>
    </DndContext>
  );
}

export interface SortableItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function SortableItem(props: SortableItemProps) {
  const { id, children, className } = props;
  const {
    setNodeRef,
    transform,
    transition,
    activeIndex,
    index,
    attributes,
    listeners,
  } = useSortable({ id });
  const isActive = activeIndex === index;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex gap-1 items-center bg-background rounded-lg p-2",
        isActive && "z-10 border shadow-md"
      )}
    >
      <GripVerticalIcon
        className={cn(
          "text-muted-foreground size-6 p-1",
          isActive ? "cursor-grabbing" : "cursor-grab"
        )}
        {...attributes}
        {...listeners}
      />
      <div className={cn("flex-grow", className)}>{children}</div>
    </div>
  );
}
