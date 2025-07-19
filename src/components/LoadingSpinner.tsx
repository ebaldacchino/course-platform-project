import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { ComponentProps } from "react";

export function LoadingSpinner(props: ComponentProps<typeof Loader2Icon>) {
  return (
    <Loader2Icon
      {...props}
      className={cn("animate-spin text-accent", props.className)}
    />
  );
}
