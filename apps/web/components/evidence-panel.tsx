import type { IncidentDetail } from "@patchpilot/shared";

import { buildEvidencePanelItems } from "@/lib/evidence";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function EvidencePanel({
  incident,
  highlightedSnippets
}: {
  incident: IncidentDetail;
  highlightedSnippets: string[];
}) {
  const items = buildEvidencePanelItems(incident.evidence, highlightedSnippets);

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Card key={item.id} className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={item.tone}>{item.kind}</Badge>
                {item.subtitle ? <span className="text-sm font-semibold text-slate-700">{item.subtitle}</span> : null}
              </div>
              <CardTitle>{item.title}</CardTitle>
              {item.metadata.length > 0 ? (
                <CardDescription>{item.metadata.join(" • ")}</CardDescription>
              ) : (
                <CardDescription>No structured signal metadata extracted from this evidence item.</CardDescription>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Relevant lines</p>
            <div className="space-y-2">
              {item.relevantLines.length > 0 ? (
                item.relevantLines.map((line, index) => (
                  <pre
                    key={`${item.id}-${index}`}
                    className={[
                      "overflow-x-auto whitespace-pre-wrap rounded-2xl border px-4 py-3 text-sm text-slate-700",
                      line.highlighted
                        ? "border-accent bg-[rgba(194,100,63,0.08)]"
                        : "border-line bg-surface"
                    ].join(" ")}
                  >
                    {line.text}
                  </pre>
                ))
              ) : (
                <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-slate-600">
                  No relevant lines were extracted for this evidence item.
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

