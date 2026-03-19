import type { EvidenceSignal, Severity } from "@patchpilot/shared";

const TIMESTAMP_RE =
  /\b\d{4}-\d{2}-\d{2}[T ][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b/;

function severityFromLine(line: string): Severity {
  if (/panic|fatal|critical/i.test(line)) return "critical";
  if (/error|exception|traceback/i.test(line)) return "error";
  if (/warn/i.test(line)) return "warning";
  return "info";
}

function baseSignal(line: string): EvidenceSignal {
  return {
    errorType: null,
    candidateFile: null,
    timestamp: line.match(TIMESTAMP_RE)?.[0] ?? null,
    relevantLines: [line],
    severity: severityFromLine(line),
    service: null,
    repeatedPatterns: []
  };
}

export function parseGenericLog(content: string): EvidenceSignal[] {
  return content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const signal = baseSignal(line);
      const file = line.match(/\b[\w./-]+\.(py|ts|tsx|js|jsx|go|java):\d+\b/);
      signal.candidateFile = file?.[0] ?? null;
      signal.errorType = line.match(/\b[A-Z][A-Za-z]+(?:Error|Exception)\b/)?.[0] ?? null;
      return signal;
    });
}

export function parsePythonTraceback(content: string): EvidenceSignal[] {
  const lines = content.split(/\r?\n/);
  const tracebackLines = lines.filter((line) => line.includes("File ") || /\w+(Error|Exception):/.test(line));
  return tracebackLines.map((line) => {
    const signal = baseSignal(line);
    signal.candidateFile = line.match(/File "([^"]+)"/)?.[1] ?? null;
    signal.errorType = line.match(/([A-Za-z]+(?:Error|Exception)):/)?.[1] ?? null;
    signal.severity = "error";
    return signal;
  });
}

export function parseNodeStack(content: string): EvidenceSignal[] {
  return content
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("at ") || /\w+Error:/.test(line))
    .map((line) => {
      const signal = baseSignal(line);
      signal.candidateFile =
        line.match(/\(([^)]+\.(?:ts|tsx|js|jsx):\d+:\d+)\)/)?.[1] ??
        line.match(/at ([^\s]+\.(?:ts|tsx|js|jsx):\d+:\d+)/)?.[1] ??
        null;
      signal.errorType = line.match(/([A-Za-z]+Error):/)?.[1] ?? null;
      signal.severity = "error";
      return signal;
    });
}

