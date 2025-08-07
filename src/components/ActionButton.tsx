"use client";

import { actionToast } from "@/hooks/actionToast";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { ComponentPropsWithRef, type ReactNode, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

export interface ActionButtonProps
  extends Omit<ComponentPropsWithRef<typeof Button>, "onClick"> {
  action: () => Promise<{ error: boolean; message: string }>;
  requireAreYouSure?: boolean;
}

export function ActionButton(props: ActionButtonProps) {
  const { action, requireAreYouSure = false, ...buttonProps } = props;
  const [isLoading, startTransition] = useTransition();

  function performAction() {
    startTransition(async () => {
      const data = await action();
      actionToast(data);
    });
  }

  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger asChild>
          <Button {...buttonProps} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isLoading} onClick={performAction}>
              <LoadingTextSwap isLoading={isLoading}>Yes</LoadingTextSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button {...buttonProps} disabled={isLoading} onClick={performAction}>
      <LoadingTextSwap isLoading={isLoading}>{props.children}</LoadingTextSwap>
    </Button>
  );
}

export interface LoadingTextSwapProps {
  isLoading: boolean;
  children: ReactNode;
}

function LoadingTextSwap(props: LoadingTextSwapProps) {
  const { isLoading, children } = props;
  return (
    <div className="grid items-center justify-items-center">
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2",
          isLoading ? "invisible" : "visible"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 text-center",
          isLoading ? "visible" : "invisible"
        )}
      >
        <Loader2Icon className="animate-spin" />
      </div>
    </div>
  );
}
