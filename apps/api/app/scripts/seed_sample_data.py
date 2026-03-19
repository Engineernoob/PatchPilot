from __future__ import annotations

import json
from pathlib import Path

from sqlmodel import Session, select

from app.db import engine, init_db
from app.models import Evidence, Incident
from app.services.analysis import AnalysisService
from app.services.parsers import parse_content


DATA_DIR = Path("/data/sample-incidents")
analysis_service = AnalysisService()


def main() -> None:
    init_db()
    files = sorted(DATA_DIR.glob("*.json"))
    if not files:
        print("No sample incidents found.")
        return

    with Session(engine) as session:
        for file_path in files:
            payload = json.loads(file_path.read_text(encoding="utf-8"))
            existing = session.exec(select(Incident).where(Incident.title == payload["title"])).first()
            if existing is not None:
                print(f"Skipping existing incident for {payload['title']}")
                continue

            incident = Incident(
                title=payload["title"],
                description=payload["description"],
                repo_url=payload.get("repo_url"),
                status="pending",
            )
            session.add(incident)
            session.commit()
            session.refresh(incident)

            description_kind, description_signal = parse_content(payload["description"], "description")
            session.add(
                Evidence(
                    incident_id=incident.id,
                    kind=description_kind,
                    source_name="seed-description",
                    raw_content=payload["description"],
                    signal=description_signal.model_dump(),
                )
            )

            logs = payload.get("logs")
            if logs:
                logs_kind, logs_signal = parse_content(logs, "log")
                session.add(
                    Evidence(
                        incident_id=incident.id,
                        kind=logs_kind,
                        source_name=file_path.name,
                        raw_content=logs,
                        signal=logs_signal.model_dump(),
                    )
                )

            session.commit()
            analysis_service.analyze_incident(session, incident)
            print(f"Seeded incident {incident.id} from {file_path.name}")


if __name__ == "__main__":
    main()
