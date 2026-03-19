"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { createIncident, analyzeIncident } from "@/lib/api";

type FormState = {
  title: string;
  description: string;
  repoUrl: string;
  logs: string;
};

const initialState: FormState = {
  title: "",
  description: "",
  repoUrl: "",
  logs: ""
};

export function IncidentForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className="max-w-4xl">
      <div className="mb-8 space-y-2">
        <CardTitle>Submit an incident</CardTitle>
        <CardDescription>
          PatchPilot ingests the report, normalizes evidence, runs an analysis pass, and stores the generated
          incident artifacts for later review.
        </CardDescription>
      </div>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setStatusMessage("Persisting incident and evidence...");

          startTransition(async () => {
            try {
              const screenshotContentBase64 = screenshot ? await toBase64(screenshot) : null;
              const incident = await createIncident({
                title: form.title,
                description: form.description,
                repoUrl: form.repoUrl || null,
                logs: form.logs || null,
                screenshotName: screenshot?.name ?? null,
                screenshotContentBase64
              });
              setStatusMessage("Running PatchPilot analysis...");
              await analyzeIncident(incident.id);
              router.push(`/incidents/${incident.id}`);
            } catch (submissionError) {
              setStatusMessage(null);
              setError(
                submissionError instanceof Error
                  ? submissionError.message
                  : "PatchPilot could not process the incident."
              );
            }
          });
        }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Incident title</span>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-accent"
              placeholder="Checkout API returns 500 on retry path"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Repository URL</span>
            <input
              value={form.repoUrl}
              onChange={(event) => setForm((current) => ({ ...current, repoUrl: event.target.value }))}
              className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-accent"
              placeholder="https://github.com/acme/checkout"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            className="w-full rounded-[24px] border border-line bg-white px-4 py-3 outline-none transition focus:border-accent"
            placeholder="Describe the incident symptoms, recent changes, and customer impact."
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Logs or stack trace</span>
          <textarea
            rows={10}
            value={form.logs}
            onChange={(event) => setForm((current) => ({ ...current, logs: event.target.value }))}
            className="w-full rounded-[24px] border border-line bg-white px-4 py-3 font-mono text-sm outline-none transition focus:border-accent"
            placeholder="Paste application logs, Python tracebacks, or Node.js stack traces."
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Screenshot (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setScreenshot(event.target.files?.[0] ?? null)}
            className="block w-full rounded-2xl border border-dashed border-line bg-white px-4 py-5 text-sm text-slate-600"
          />
        </label>

        {statusMessage ? <p className="text-sm font-medium text-steel">{statusMessage}</p> : null}
        {error ? <p className="text-sm font-medium text-accentDark">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={isPending} type="submit">
            {isPending ? "Analyzing incident..." : "Run incident analysis"}
          </Button>
          <p className="text-sm text-slate-600">Creates the incident record and immediately runs the analysis pipeline.</p>
        </div>
      </form>
    </Card>
  );
}

async function toBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
