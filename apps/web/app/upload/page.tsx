import { IncidentForm } from "@/components/incident-form";
import { Section } from "@/components/section";

export default function UploadPage() {
  return (
    <Section
      eyebrow="New Incident"
      title="Upload evidence and run PatchPilot"
      description="Submit the title, incident narrative, logs, and any screenshot evidence. The backend will persist the incident and run the analysis pipeline."
    >
      <IncidentForm />
    </Section>
  );
}

