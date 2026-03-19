import Link from "next/link";

import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "JSON-first analysis pipeline",
    description: "Every AI stage targets strict JSON and falls back to deterministic heuristics when model output is malformed."
  },
  {
    title: "Evidence normalization",
    description: "Generic logs, Python tracebacks, and Node.js stack traces are normalized into structured signals before analysis."
  },
  {
    title: "Developer-ready artifacts",
    description: "PatchPilot returns ranked hypotheses, suggested fixes, a draft commit message, and a pull request summary."
  }
];

const pillars = [
  "FastAPI backend with SQLModel persistence",
  "Next.js 15 dashboard with typed API contracts",
  "Ollama integration isolated behind a service layer",
  "Docker Compose dev environment with Postgres"
];

export default function LandingPage() {
  return (
    <div className="space-y-16 pb-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Badge tone="critical">Production-style MVP</Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-ink sm:text-6xl">
              Triage incidents like a support engineer, not a generic chatbot.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              PatchPilot ingests bug reports, logs, stack traces, and screenshots, then turns them into a concise
              incident brief with actionable engineering artifacts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/upload">
              <Button>Analyze a new incident</Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost">View incident history</Button>
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden bg-[linear-gradient(160deg,#1f2937_0%,#314355_100%)] text-white">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                PatchPilot Runbook
              </span>
              <span className="text-sm text-slate-200">MVP pipeline</span>
            </div>
            <ol className="space-y-4 text-sm leading-6 text-slate-100">
              <li>1. Normalize uploaded evidence into typed signals.</li>
              <li>2. Extract error classes, candidate files, timestamps, and repeated patterns.</li>
              <li>3. Generate JSON summaries, ranked hypotheses, and remediation guidance.</li>
              <li>4. Store artifacts for later review, iteration, and pull request drafting.</li>
            </ol>
          </div>
        </Card>
      </section>

      <Section
        eyebrow="Why it feels real"
        title="Focused on the work developers actually need after an incident lands."
        description="The MVP avoids speculative automation and centers on the evidence, likely causes, and next edits."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="space-y-3">
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Architecture"
        title="Built as a small monorepo with strong contracts."
        description="Shared schemas keep the frontend typed, while the API owns persistence, parsing, and Ollama orchestration."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <Card key={pillar}>
              <CardTitle>{pillar}</CardTitle>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

