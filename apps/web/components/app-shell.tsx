import Link from "next/link";
import type { PropsWithChildren } from "react";

const nav = [
  { href: "/", label: "Overview" },
  { href: "/upload", label: "New Incident" },
  { href: "/history", label: "History" }
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="grain min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-12 pt-6 sm:px-8 lg:px-10">
        <header className="mb-10 flex flex-col gap-5 rounded-[28px] border border-line bg-white/60 px-6 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-2xl font-black tracking-tight text-ink">
              PatchPilot
            </Link>
            <p className="text-sm text-slate-600">AI incident triage for developer support workflows.</p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

