from __future__ import annotations

import re
from collections import Counter

from app.schemas import EvidenceSignal


TIMESTAMP_RE = re.compile(
    r"\b\d{4}-\d{2}-\d{2}[T ][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b"
)
ERROR_RE = re.compile(r"\b([A-Z][A-Za-z]+(?:Error|Exception))\b")
FILE_RE = re.compile(r"\b([\w./-]+\.(?:py|ts|tsx|js|jsx|go|java))(?::\d+)?\b")
SERVICE_RE = re.compile(r"(?:service=|\[)([a-z0-9_-]+)(?:\]| )", re.IGNORECASE)


def _severity_from_line(line: str) -> str:
    if re.search(r"panic|fatal|critical", line, re.IGNORECASE):
        return "critical"
    if re.search(r"error|exception|traceback", line, re.IGNORECASE):
        return "error"
    if re.search(r"warn", line, re.IGNORECASE):
        return "warning"
    return "info"


def _signal(line: str) -> EvidenceSignal:
    return EvidenceSignal(
        error_type=(ERROR_RE.search(line).group(1) if ERROR_RE.search(line) else None),
        candidate_file=(FILE_RE.search(line).group(1) if FILE_RE.search(line) else None),
        timestamp=(TIMESTAMP_RE.search(line).group(0) if TIMESTAMP_RE.search(line) else None),
        relevant_lines=[line.strip()],
        severity=_severity_from_line(line),
        service=(SERVICE_RE.search(line).group(1) if SERVICE_RE.search(line) else None),
        repeated_patterns=[],
    )


def parse_generic_logs(content: str) -> list[EvidenceSignal]:
    lines = [line for line in content.splitlines() if line.strip()]
    return [_signal(line) for line in lines[:50]]


def parse_python_traceback(content: str) -> list[EvidenceSignal]:
    lines = []
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith('File "') or ERROR_RE.search(stripped):
            signal = _signal(stripped)
            file_match = re.search(r'File "([^"]+)"', stripped)
            if file_match:
                signal.candidate_file = file_match.group(1)
            signal.severity = "error"
            lines.append(signal)
    return lines


def parse_node_stacktrace(content: str) -> list[EvidenceSignal]:
    signals: list[EvidenceSignal] = []
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith("at ") or re.search(r"[A-Za-z]+Error:", stripped):
            signal = _signal(stripped)
            location_match = re.search(r"\(([^)]+\.(?:ts|tsx|js|jsx):\d+:\d+)\)", stripped)
            if location_match:
                signal.candidate_file = location_match.group(1)
            signal.severity = "error"
            signals.append(signal)
    return signals


def infer_evidence_kind(raw_content: str, preferred_kind: str | None = None) -> str:
    if preferred_kind and preferred_kind not in {"description", "log"}:
        return preferred_kind
    if "Traceback (most recent call last)" in raw_content:
        return "traceback"
    if re.search(r"^\s+at .+\(.+:\d+:\d+\)$", raw_content, re.MULTILINE):
        return "stacktrace"
    return preferred_kind or "log"


def parse_content(raw_content: str, preferred_kind: str | None = None) -> tuple[str, EvidenceSignal]:
    kind = infer_evidence_kind(raw_content, preferred_kind)
    if kind == "traceback":
        parsed = parse_python_traceback(raw_content)
    elif kind == "stacktrace":
        parsed = parse_node_stacktrace(raw_content)
    else:
        parsed = parse_generic_logs(raw_content)

    if not parsed:
        parsed = [_signal(raw_content[:400])]

    relevant_lines = [line for signal in parsed for line in signal.relevant_lines][:6]
    repeated = [
        item
        for item, count in Counter(line for line in relevant_lines if line).items()
        if count > 1
    ]
    first = parsed[0]
    merged = EvidenceSignal(
        error_type=next((signal.error_type for signal in parsed if signal.error_type), None),
        candidate_file=next((signal.candidate_file for signal in parsed if signal.candidate_file), None),
        timestamp=next((signal.timestamp for signal in parsed if signal.timestamp), None),
        relevant_lines=relevant_lines,
        severity=max((signal.severity for signal in parsed), key=_severity_rank, default=first.severity),
        service=next((signal.service for signal in parsed if signal.service), None),
        repeated_patterns=repeated,
    )
    return kind, merged


def _severity_rank(level: str) -> int:
    order = {"info": 0, "warning": 1, "error": 2, "critical": 3}
    return order.get(level, 0)


def extract_signal_rollup(signals: list[EvidenceSignal]) -> dict[str, list[str]]:
    return {
        "errors": _top_values(signal.error_type for signal in signals),
        "files": _top_values(signal.candidate_file for signal in signals),
        "timestamps": _top_values(signal.timestamp for signal in signals),
        "services": _top_values(signal.service for signal in signals),
        "patterns": _top_values(pattern for signal in signals for pattern in signal.repeated_patterns),
    }


def _top_values(values) -> list[str]:
    cleaned = [value for value in values if value]
    return [value for value, _ in Counter(cleaned).most_common(5)]

