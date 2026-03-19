"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

export function Tabs({ tabs, defaultValue }: { tabs: TabItem[]; defaultValue?: string }) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);
  const current = tabs.find((tab) => tab.value === active) ?? tabs[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-full border border-line bg-white/60 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              active === tab.value ? "bg-accent text-white" : "text-slate-600 hover:bg-slate-200/60"
            )}
            onClick={() => setActive(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{current?.content}</div>
    </div>
  );
}

