from __future__ import annotations

import json
from json import JSONDecodeError
from typing import TypeVar
from urllib import request
from urllib.error import HTTPError, URLError

from pydantic import BaseModel, ValidationError

from app.config import get_settings


SchemaT = TypeVar("SchemaT", bound=BaseModel)


class OllamaService:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = settings.ollama_url.rstrip("/")
        self.model = settings.ollama_model
        self.max_attempts = 2

    def generate_json(self, prompt: str, schema: type[SchemaT]) -> SchemaT | None:
        repair_instruction = (
            "\n\nYour previous response was not valid for the requested schema. "
            "Return a single JSON object only with the exact requested keys."
        )
        prompts = [prompt, f"{prompt}{repair_instruction}"]

        for attempt_prompt in prompts[: self.max_attempts]:
            body = self._request(attempt_prompt)
            if body is None:
                continue

            candidate = self._coerce_candidate(body.get("response"))
            if candidate is None:
                continue

            try:
                return schema.model_validate(candidate)
            except ValidationError:
                continue

        return None

    def _request(self, prompt: str) -> dict | None:
        payload = json.dumps(
            {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "format": "json",
            }
        ).encode("utf-8")

        req = request.Request(
            url=f"{self.base_url}/api/generate",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=45) as response:
                return json.loads(response.read().decode("utf-8"))
        except (TimeoutError, URLError, HTTPError, OSError, JSONDecodeError):
            return None

    def _coerce_candidate(self, raw_response: object) -> dict | None:
        if isinstance(raw_response, dict):
            return raw_response
        if not isinstance(raw_response, str):
            return None

        parsed = self._parse_json(raw_response)
        if isinstance(parsed, dict):
            return parsed

        extracted = self._extract_json_object(raw_response)
        if extracted is None:
            return None

        parsed = self._parse_json(extracted)
        return parsed if isinstance(parsed, dict) else None

    def _parse_json(self, raw_text: str) -> object | None:
        try:
            return json.loads(raw_text)
        except JSONDecodeError:
            return None

    def _extract_json_object(self, raw_text: str) -> str | None:
        start = raw_text.find("{")
        if start == -1:
            return None

        depth = 0
        in_string = False
        escaped = False
        for index in range(start, len(raw_text)):
            char = raw_text[index]
            if escaped:
                escaped = False
                continue
            if char == "\\":
                escaped = True
                continue
            if char == '"':
                in_string = not in_string
                continue
            if in_string:
                continue
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    return raw_text[start : index + 1]

        return None
