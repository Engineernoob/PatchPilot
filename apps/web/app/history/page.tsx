import { HistoryList } from "@/components/history-list";
import { Section } from "@/components/section";
import { listIncidents } from "@/lib/api";

export default async function HistoryPage() {
  const incidents = await listIncidents();

  return (
    <Section
      eyebrow="Incident History"
      title="Review previous analyses"
      description="Stored incidents act as a lightweight working memory for developer support triage."
    >
      <HistoryList incidents={incidents} />
    </Section>
  );
}

