import { notFound } from "next/navigation";

import { ResultsView } from "@/components/results-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getIncident, getResults } from "@/lib/api";

export default async function IncidentResultsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const incident = await getIncident(id);
    const result = await getResults(id);

    if (!result) {
      return (
        <Card className="max-w-3xl space-y-4">
          <Badge tone="warning">{incident.status}</Badge>
          <CardTitle>Analysis has not completed yet</CardTitle>
          <CardDescription>
            PatchPilot has stored the incident but no generated artifacts are available yet. Re-run the analysis
            endpoint or inspect the API service logs.
          </CardDescription>
        </Card>
      );
    }

    return <ResultsView incident={incident} result={result} />;
  } catch {
    notFound();
  }
}
