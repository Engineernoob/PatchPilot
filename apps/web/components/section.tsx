import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Section({
  children,
  className,
  eyebrow,
  title,
  description
}: PropsWithChildren<{
  className?: string;
  eyebrow?: string;
  title: string;
  description?: string;
}>) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accentDark">{eyebrow}</p>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
        {description ? <p className="max-w-3xl text-base leading-7 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

