import type { Evidence } from "@patchpilot/shared";

export type EvidencePanelItem = {
  id: string;
  title: string;
  kind: Evidence["kind"];
  tone: "default" | "warning" | "critical";
  subtitle: string | null;
  metadata: string[];
  relevantLines: Array<{
    text: string;
    highlighted: boolean;
  }>;
};

export function buildEvidencePanelItems(
  evidence: Evidence[],
  highlightedSnippets: string[]
): EvidencePanelItem[] {
  const normalizedHighlights = highlightedSnippets.map(normalizeText).filter(Boolean);

  return evidence.map((item, index) => {
    const metadata = [
      item.signal.errorType,
      item.signal.candidateFile,
      item.signal.timestamp,
      item.signal.service ? `service=${item.signal.service}` : null
    ].filter((value): value is string => Boolean(value));
    const relevantLines = item.signal.relevantLines.slice(0, 6).map((line) => {
      const normalizedLine = normalizeText(line);
      return {
        text: line,
        highlighted:
          normalizedHighlights.includes(normalizedLine) ||
          normalizedHighlights.some((snippet) => snippet.includes(normalizedLine) || normalizedLine.includes(snippet))
      };
    });

    return {
      id: item.id,
      title: item.sourceName ?? `${item.kind} evidence ${index + 1}`,
      kind: item.kind,
      tone: toneForEvidence(item),
      subtitle: item.signal.errorType ?? item.signal.candidateFile ?? null,
      metadata,
      relevantLines
    };
  });
}

function toneForEvidence(item: Evidence): "default" | "warning" | "critical" {
  if (item.signal.severity === "critical" || item.signal.severity === "error") {
    return "critical";
  }
  if (item.signal.severity === "warning") {
    return "warning";
  }
  return "default";
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

