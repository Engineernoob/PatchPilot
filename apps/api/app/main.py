from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.incidents import router as incidents_router
from app.config import get_settings
from app.db import init_db


settings = get_settings()
app = FastAPI(
    title="PatchPilot API",
    version="0.1.0",
    description="AI-assisted incident triage for logs, traces, screenshots, and bug reports.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_origin, "http://localhost:3000", "http://web:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(incidents_router)
