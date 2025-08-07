import { cn } from "@/lib/utils";
import { AsteriskIcon } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";

type RequiredLabelIconProps = ComponentPropsWithoutRef<typeof AsteriskIcon>;

export function RequiredLabelIcon(props: RequiredLabelIconProps) {
  const { className } = props;
  return (
    <AsteriskIcon
      {...props}
      className={cn("text-destructive inline size-4 align-top", className)}
    />
  );
}
