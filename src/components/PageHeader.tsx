import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type PageHeaderProps = PropsWithChildren<{ title: string; className?: string }>;

export function PageHeader(props: PageHeaderProps) {
  const { title, children, className } = props;
  return (
    <div
      className={cn("mb-8 flex gap-4 items-center justify-between", className)}
    >
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children && <div>{children}</div>}
    </div>
  );
}
