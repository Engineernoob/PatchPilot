import type { Hypothesis } from "@patchpilot/shared";

export type HypothesisEval = {
  rank: number;
  coverageScore: number;
  evidenceCount: number;
};

export function evaluateHypotheses(hypotheses: Hypothesis[]): HypothesisEval[] {
  return hypotheses.map((hypothesis) => ({
    rank: hypothesis.rank,
    evidenceCount: hypothesis.evidenceSnippets.length,
    coverageScore: Number(
      Math.min(1, hypothesis.confidence + hypothesis.evidenceSnippets.length * 0.05).toFixed(2)
    )
  }));
}
