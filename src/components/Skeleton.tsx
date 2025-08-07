import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { buttonVariants } from "./ui/button";

interface SkeletonButtonProps {
  className?: string;
}

export function SkeletonButton(props: SkeletonButtonProps) {
  return (
    <div
      className={cn(
        buttonVariants({
          variant: "secondary",
          className: "pointer-events-none animate-pulse w-24",
        }),
        props.className
      )}
    />
  );
}

export interface SkeletonArrayProps {
  amount: number;
  children: ReactNode;
}

export function SkeletonArray(props: SkeletonArrayProps) {
  const { amount, children } = props;
  return Array.from({ length: amount }).map(() => children);
}

export interface SkeletonTextProps {
  rows?: number;
  size?: "md" | "lg";
  className?: string;
}

export function SkeletonText(props: SkeletonTextProps) {
  const { rows = 1, size = "md", className } = props;
  return (
    <div className="flex flex-col gap-1">
      <SkeletonArray amount={rows}>
        <div
          className={cn(
            "bg-secondary animate-pulse w-full rounded-sm",
            rows > 1 && "last:w-3/4",
            size === "md" && "h-3",
            size === "lg" && "h-5",
            className
          )}
        />
      </SkeletonArray>
    </div>
  );
}
