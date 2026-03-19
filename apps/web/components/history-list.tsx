import Link from "next/link";

import type { Incident } from "@patchpilot/shared";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function HistoryList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardTitle>No incidents yet</CardTitle>
        <CardDescription>Use the upload flow to create the first incident analysis.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {incidents.map((incident) => (
        <Link key={incident.id} href={`/incidents/${incident.id}`}>
          <Card className="space-y-4 transition hover:-translate-y-0.5 hover:border-accent">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <Badge tone={incident.status === "analyzed" ? "success" : "warning"}>{incident.status}</Badge>
                <CardTitle>{incident.title}</CardTitle>
              </div>
              <span className="text-sm text-slate-500">{new Date(incident.createdAt).toLocaleString()}</span>
            </div>
            <CardDescription>{incident.description}</CardDescription>
            {incident.summary ? (
              <p className="rounded-2xl bg-surface px-4 py-3 text-sm leading-6 text-slate-700">{incident.summary}</p>
            ) : null}
          </Card>
        </Link>
      ))}
    </div>
  );
}
