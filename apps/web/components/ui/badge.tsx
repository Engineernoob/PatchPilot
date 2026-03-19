import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "default" | "success" | "warning" | "critical";

const tones: Record<BadgeTone, string> = {
  default: "bg-[rgba(75,100,120,0.12)] text-steel",
  success: "bg-[rgba(34,84,61,0.14)] text-success",
  warning: "bg-[rgba(154,107,24,0.14)] text-warning",
  critical: "bg-[rgba(140,61,32,0.12)] text-accentDark"
};

export function Badge({
  children,
  className,
  tone = "default",
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLSpanElement>> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

