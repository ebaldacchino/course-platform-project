"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
export interface DialogProps
  extends React.ComponentProps<typeof DialogPrimitive.Root> {}

function Dialog(props: DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export interface DialogTriggerProps
  extends React.ComponentProps<typeof DialogPrimitive.Trigger> {}

function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 flex w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border shadow-lg duration-200 sm:max-w-lg max-h-11/12 flex-col h-fit overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader(props: React.ComponentProps<"div">) {
  const className = cn(
    "flex flex-col gap-2 text-center sm:text-left p-6",
    props.className
  );
  return <div data-slot="dialog-header" {...props} className={className} />;
}

function DialogFooter(props: React.ComponentProps<"div">) {
  const className = cn(
    "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
    props.className
  );
  return <div data-slot="dialog-footer" {...props} className={className} />;
}

export interface DialogTitleProps
  extends React.ComponentProps<typeof DialogPrimitive.Title> {}

function DialogTitle(props: DialogTitleProps) {
  const className = cn("text-lg leading-none font-semibold", props.className);
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      {...props}
      className={className}
    />
  );
}

export interface DialogDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {}

function DialogDescription(props: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      {...props}
      className={cn("text-muted-foreground text-sm", props.className)}
    />
  );
}

export interface DialogBodyProps
  extends React.ComponentProps<typeof DialogPrimitive.Description> {}

function DialogBody(props: DialogBodyProps) {
  const className = cn("overflow-y-auto px-6 pb-6", props.className);
  return <div {...props} className={className} />;
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
