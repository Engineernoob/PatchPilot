# Frequently Asked Questions

## What is PatchPilot?

PatchPilot is an AI-powered debugging assistant that analyzes logs, stack traces, screenshots, and bug reports to generate structured incident summaries, ranked root-cause hypotheses, and suggested fixes.

---

## Who is PatchPilot for?

PatchPilot is designed for:

- Software engineers
- Full-stack developers
- Backend engineers
- DevOps engineers
- QA engineers
- Engineering teams investigating production issues

---

## Does PatchPilot send my data to the cloud?

No. The MVP is designed to run locally using Ollama, allowing AI inference to occur on your own machine. This privacy-first approach keeps debugging evidence under your control.

---

## What kinds of evidence can I upload?

PatchPilot currently supports:

- Log files
- Stack traces
- Screenshots
- Bug reports
- Console output

Support for additional evidence types may be added in future releases.

---

## Which AI models are supported?

The MVP uses Ollama for local inference. Any compatible model installed through Ollama can be configured, although some models may produce better debugging results than others.

---

## Can PatchPilot automatically fix my code?

No. PatchPilot generates suggested fixes and engineering artifacts, but developers remain responsible for reviewing, validating, and applying any recommended changes.

---

## Does PatchPilot replace debugging tools?

No. PatchPilot complements existing debugging workflows by helping engineers organize evidence, identify likely causes, and accelerate investigation.

---

## Is internet access required?

No. After installation and model download, PatchPilot can operate entirely offline using local AI models.

---

## How are confidence scores calculated?

Confidence scores represent the AI's relative confidence in each generated hypothesis based on the available evidence. They are intended to help prioritize investigation rather than serve as definitive correctness guarantees.

---

## Is PatchPilot production ready?

Not yet. PatchPilot is currently in active MVP development. Features, APIs, and documentation may change as the project evolves.

---

## Where can I report bugs or request features?

Please open a GitHub Issue describing the problem or feature request. Include reproduction steps, relevant logs, screenshots, and environment information whenever possible.

---

## Where should I go next?

If you're new to PatchPilot, continue with:

- `getting-started.md`
- `architecture.md`
- `api-reference.md`
- `ai-pipeline.md`
- `troubleshooting.md`
