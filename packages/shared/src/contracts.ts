import { z } from "zod";

export const IncidentStatusSchema = z.enum([
  "pending",
  "analyzing",
  "analyzed",
  "failed"
]);

export const EvidenceKindSchema = z.enum([
  "description",
  "log",
  "traceback",
  "stacktrace",
  "screenshot"
]);

export const SeveritySchema = z.enum(["info", "warning", "error", "critical"]);

export const EvidenceSignalSchema = z.object({
  errorType: z.string().nullable().default(null),
  candidateFile: z.string().nullable().default(null),
  timestamp: z.string().nullable().default(null),
  relevantLines: z.array(z.string()).default([]),
  severity: SeveritySchema.default("info"),
  service: z.string().nullable().default(null),
  repeatedPatterns: z.array(z.string()).default([])
});

export const EvidenceSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  kind: EvidenceKindSchema,
  sourceName: z.string().nullable().default(null),
  rawContent: z.string(),
  signal: EvidenceSignalSchema,
  createdAt: z.string()
});

export const HypothesisSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  rank: z.number().int().min(1).max(3),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  evidenceSnippets: z.array(z.string()).default([])
});

export const FixSuggestionSchema = z.object({
  id: z.string(),
  incidentId: z.string(),
  hypothesisRank: z.number().int().min(1).max(3).nullable().default(null),
  title: z.string(),
  description: z.string(),
  patchHint: z.string().nullable().default(null)
});

export const IncidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  repoUrl: z.string().url().nullable().default(null),
  status: IncidentStatusSchema,
  summary: z.string().nullable().default(null),
  commitMessage: z.string().nullable().default(null),
  prSummary: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const IncidentDetailSchema = IncidentSchema.extend({
  evidence: z.array(EvidenceSchema).default([]),
  hypotheses: z.array(HypothesisSchema).default([]),
  fixSuggestions: z.array(FixSuggestionSchema).default([])
});

export const AnalysisResultSchema = z.object({
  incidentId: z.string(),
  summary: z.string(),
  hypotheses: z.array(HypothesisSchema).length(3),
  fixSuggestions: z.array(FixSuggestionSchema).min(1),
  commitMessage: z.string(),
  prSummary: z.string(),
  evidenceSnippets: z.array(z.string()).default([]),
  generatedAt: z.string()
});

export const CreateIncidentRequestSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  repoUrl: z.string().url().nullable().optional(),
  logs: z.string().nullable().optional(),
  screenshotName: z.string().nullable().optional(),
  screenshotContentBase64: z.string().nullable().optional()
});

export const AddEvidenceRequestSchema = z.object({
  kind: EvidenceKindSchema,
  sourceName: z.string().nullable().optional(),
  rawContent: z.string().min(1)
});

export const IncidentListSchema = z.array(IncidentSchema);

export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;
export type EvidenceKind = z.infer<typeof EvidenceKindSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type EvidenceSignal = z.infer<typeof EvidenceSignalSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Hypothesis = z.infer<typeof HypothesisSchema>;
export type FixSuggestion = z.infer<typeof FixSuggestionSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
export type IncidentDetail = z.infer<typeof IncidentDetailSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type CreateIncidentRequest = z.infer<typeof CreateIncidentRequestSchema>;
export type AddEvidenceRequest = z.infer<typeof AddEvidenceRequestSchema>;

