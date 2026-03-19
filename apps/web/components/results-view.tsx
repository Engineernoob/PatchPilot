import { evaluateHypotheses } from "@patchpilot/evals";
import type { AnalysisResult, IncidentDetail } from "@patchpilot/shared";

import { EvidencePanel } from "@/components/evidence-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

export function ResultsView({
  incident,
  result
}: {
  incident: IncidentDetail;
  result: AnalysisResult;
}) {
  const evals = evaluateHypotheses(result.hypotheses);
  const highlightedSnippets = [
    ...result.evidenceSnippets,
    ...result.hypotheses.flatMap((hypothesis) => hypothesis.evidenceSnippets)
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge tone={incident.status === "analyzed" ? "success" : "warning"}>{incident.status}</Badge>
            <CardTitle className="text-2xl">{incident.title}</CardTitle>
            <CardDescription>{incident.description}</CardDescription>
          </div>
          <div className="rounded-[24px] bg-surface px-5 py-4 text-sm text-slate-600">
            <div>Created {new Date(incident.createdAt).toLocaleString()}</div>
            <div>Updated {new Date(incident.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-4">
          <Badge>Incident Summary</Badge>
          <CardTitle>Concise incident narrative</CardTitle>
          <CardDescription className="text-base">{result.summary}</CardDescription>
        </Card>

        <Card className="space-y-4">
          <Badge tone="critical">Generated Artifacts</Badge>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Draft commit message
              </p>
              <pre className="rounded-2xl bg-surface px-4 py-3 text-sm font-medium text-ink">{result.commitMessage}</pre>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Draft PR summary
              </p>
              <p className="rounded-2xl bg-surface px-4 py-3 text-sm leading-6 text-slate-700">{result.prSummary}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <Badge tone="warning">Evidence Extraction</Badge>
            <CardTitle>Normalized evidence with highlighted signals</CardTitle>
          </div>
          <span className="text-sm text-slate-500">{incident.evidence.length} evidence items stored</span>
        </div>
        <EvidencePanel incident={incident} highlightedSnippets={highlightedSnippets} />
      </Card>

      <Tabs
        defaultValue="hypotheses"
        tabs={[
          {
            value: "hypotheses",
            label: "Hypotheses",
            content: (
              <div className="grid gap-4 lg:grid-cols-3">
                {result.hypotheses.map((hypothesis) => {
                  const evaluation = evals.find((item) => item.rank === hypothesis.rank);
                  return (
                    <Card key={hypothesis.id} className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <Badge tone={hypothesis.rank === 1 ? "critical" : "default"}>Rank #{hypothesis.rank}</Badge>
                        <span className="text-sm font-semibold text-slate-600">
                          {(hypothesis.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <CardTitle>{hypothesis.title}</CardTitle>
                      <CardDescription>{hypothesis.description}</CardDescription>
                      <div className="rounded-2xl bg-surface px-4 py-3 text-sm text-slate-600">
                        Coverage score {evaluation?.coverageScore.toFixed(2) ?? "0.00"}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )
          },
          {
            value: "fixes",
            label: "Suggested Fixes",
            content: (
              <div className="grid gap-4">
                {result.fixSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge tone="warning">
                        {suggestion.hypothesisRank ? `Hypothesis #${suggestion.hypothesisRank}` : "General"}
                      </Badge>
                      <CardTitle>{suggestion.title}</CardTitle>
                    </div>
                    <CardDescription>{suggestion.description}</CardDescription>
                    {suggestion.patchHint ? (
                      <pre className="rounded-2xl bg-surface px-4 py-3 text-sm text-slate-700">{suggestion.patchHint}</pre>
                    ) : null}
                  </Card>
                ))}
              </div>
            )
          },
          {
            value: "evidence",
            label: "Evidence Snippets",
            content: (
              <div className="grid gap-4 lg:grid-cols-2">
                {result.evidenceSnippets.map((snippet, index) => (
                  <Card key={`${snippet}-${index}`} className="space-y-3">
                    <Badge>Snippet #{index + 1}</Badge>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-surface px-4 py-3 text-sm text-slate-700">
                      {snippet}
                    </pre>
                  </Card>
                ))}
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
