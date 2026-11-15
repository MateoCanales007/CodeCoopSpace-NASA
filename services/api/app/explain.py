"""Explicación en lenguaje sencillo del resultado ya calculado.

Groq se llama solo desde el servidor. El modelo recibe un resumen corto de las
respuestas, los datos, las valoraciones y las fuentes permitidas, y redacta:
no elige cultivos ni aporta cifras. Su salida se valida; ante cualquier fallo
se devuelve la explicación breve que arma el propio backend.
"""

import hashlib
import json
import logging
import os
import re
import threading
import time
from collections.abc import Callable
from typing import Literal

import httpx
from pydantic import BaseModel, ValidationError, field_validator

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-20b"
TIMEOUT_SECONDS = 9.0
CACHE_TTL_SECONDS = 60 * 60
CACHE_MAX_ENTRIES = 256
MAX_FIELD_CHARS = 420

logger = logging.getLogger("yago.explain")

Lang = Literal["es", "en"]
FallbackReason = Literal["not_configured", "timeout", "rate_limited", "provider_error", "invalid_output"]

FIELDS = ("consider", "influence", "caution", "verify")
NUMBER = re.compile(r"\d+(?:[.,]\d+)?")


class ExplanationText(BaseModel):
    """Lo único que puede escribir el modelo: cuatro frases cortas."""

    consider: str
    influence: str
    caution: str
    verify: str

    @field_validator(*FIELDS)
    @classmethod
    def _short_plain_text(cls, value: str) -> str:
        value = " ".join(value.split())
        if not 15 <= len(value) <= MAX_FIELD_CHARS:
            raise ValueError("length")
        if "http" in value.lower() or "www." in value.lower():
            raise ValueError("links are not allowed")
        return value


class Explanation(ExplanationText):
    source: Literal["groq", "rules"]
    model: str | None = None
    # Por qué no se usó Groq cuando `source` es "rules".
    fallbackReason: FallbackReason | None = None


JSON_SCHEMA = {
    "type": "object",
    "properties": {field: {"type": "string"} for field in FIELDS},
    "required": list(FIELDS),
    "additionalProperties": False,
}

SYSTEM_PROMPT = {
    "es": (
        "Usted explica a una persona agricultora de El Salvador el resultado de una comparación de rotaciones "
        "que YA fue calculada con reglas. Su único trabajo es redactar. Reglas estrictas:\n"
        "- Use solo los hechos del JSON que recibe. No agregue cultivos, cifras, fechas, fuentes ni consejos nuevos.\n"
        "- No cambie cuál opción destaca ni las valoraciones. No prometa cosechas ni pronostique el clima.\n"
        "- Si la opción destacada es solo la menos desfavorable, dígalo con claridad: no la presente como buena.\n"
        "- Escriba en español sencillo de El Salvador, trato de usted, frases cortas, sin tecnicismos ni siglas raras.\n"
        "- Cada campo: una o dos frases, máximo 300 caracteres, sin listas ni enlaces.\n"
        "Devuelva un objeto JSON con exactamente estos campos:\n"
        "consider: cuál opción vale la pena considerar y por qué, según la prioridad elegida.\n"
        "influence: qué respuesta de la persona o qué dato pesó más en el resultado.\n"
        "caution: la precaución más importante de esa opción.\n"
        "verify: qué conviene confirmar antes de sembrar (lo que falta en 'falta_confirmar' y hablar con un técnico)."
    ),
    "en": (
        "You explain to a farmer in El Salvador the result of a crop rotation comparison that has ALREADY been "
        "calculated with rules. Your only job is wording. Strict rules:\n"
        "- Use only the facts in the JSON you receive. Do not add crops, figures, dates, sources or new advice.\n"
        "- Do not change which option stands out or the ratings. Do not promise harvests or forecast the weather.\n"
        "- If the highlighted option is only the least unfavourable, say so plainly: do not present it as good.\n"
        "- Write in plain English, short sentences, no jargon or unusual acronyms.\n"
        "- Each field: one or two sentences, at most 300 characters, no lists or links.\n"
        "Return a JSON object with exactly these fields:\n"
        "consider: which option is worth considering and why, given the chosen priority.\n"
        "influence: which answer from the person or which piece of data weighed most in the result.\n"
        "caution: the most important caution about that option.\n"
        "verify: what to confirm before sowing (what is listed in 'still_to_confirm' and talking to an extension agent)."
    ),
}


def _numbers(text: str) -> set[float]:
    return {float(match.replace(",", ".")) for match in NUMBER.findall(text)}


def invented_numbers(text: ExplanationText, facts: dict) -> set[float]:
    """Cifras que el modelo escribió y que no están en los hechos que recibió."""
    allowed = _numbers(json.dumps(facts, ensure_ascii=False))
    written = _numbers(" ".join(getattr(text, field) for field in FIELDS))
    return written - allowed


class GroqExplainer:
    def __init__(
        self,
        api_key: str,
        model: str = DEFAULT_MODEL,
        *,
        url: str = GROQ_URL,
        transport: httpx.BaseTransport | None = None,
        timeout: float = TIMEOUT_SECONDS,
        cache_ttl: float = CACHE_TTL_SECONDS,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self._api_key = api_key
        self._model = model or DEFAULT_MODEL
        self._url = url
        self._transport = transport
        self._timeout = timeout
        self._cache_ttl = cache_ttl
        self._clock = clock
        self._cache: dict[str, tuple[float, ExplanationText]] = {}
        self._lock = threading.Lock()

    @classmethod
    def from_env(cls) -> "GroqExplainer":
        return cls(os.environ.get("GROQ_API_KEY", "").strip(), os.environ.get("GROQ_MODEL", "").strip() or DEFAULT_MODEL)

    @property
    def configured(self) -> bool:
        return bool(self._api_key)

    @property
    def model(self) -> str:
        return self._model

    def explain(self, facts: dict, language: Lang, fallback: ExplanationText) -> Explanation:
        """Explicación de Groq si llega válida y a tiempo; si no, la del backend con la causa."""

        def from_rules(reason: FallbackReason) -> Explanation:
            return Explanation(source="rules", fallbackReason=reason, **fallback.model_dump())

        if not self.configured:
            return from_rules("not_configured")

        key = hashlib.sha256(json.dumps([self._model, language, facts], sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        with self._lock:
            cached = self._cache.get(key)
        if cached and self._clock() - cached[0] < self._cache_ttl:
            return Explanation(source="groq", model=self._model, **cached[1].model_dump())

        text, reason = self._ask(facts, language)
        if text is None:
            return from_rules(reason or "provider_error")
        with self._lock:
            if len(self._cache) >= CACHE_MAX_ENTRIES:
                self._cache.pop(next(iter(self._cache)))
            self._cache[key] = (self._clock(), text)
        return Explanation(source="groq", model=self._model, **text.model_dump())

    def _payload(self, facts: dict, language: Lang, structured: bool) -> dict:
        payload: dict = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT[language]},
                {"role": "user", "content": json.dumps(facts, ensure_ascii=False)},
            ],
            "temperature": 0.2,
            "max_completion_tokens": 1200,
        }
        if structured:
            payload["response_format"] = {
                "type": "json_schema",
                "json_schema": {"name": "rotation_explanation", "strict": True, "schema": JSON_SCHEMA},
            }
        else:
            # Modo JSON simple para modelos sin esquema estricto; la validación la hace el backend.
            payload["response_format"] = {"type": "json_object"}
        return payload

    def _ask(self, facts: dict, language: Lang) -> tuple[ExplanationText | None, FallbackReason | None]:
        headers = {"Authorization": f"Bearer {self._api_key}", "Content-Type": "application/json"}
        try:
            with httpx.Client(timeout=self._timeout, transport=self._transport) as client:
                response = client.post(self._url, headers=headers, json=self._payload(facts, language, structured=True))
                if response.status_code == 400:
                    response = client.post(self._url, headers=headers, json=self._payload(facts, language, structured=False))
        except httpx.TimeoutException:
            logger.warning("Groq no respondió a tiempo; se usa la explicación del backend.")
            return None, "timeout"
        except httpx.HTTPError as error:
            logger.warning("Groq falló (%s); se usa la explicación del backend.", type(error).__name__)
            return None, "provider_error"

        if response.status_code == 429:
            logger.warning("Groq llegó al límite de uso; se usa la explicación del backend.")
            return None, "rate_limited"
        if response.status_code != 200:
            # Solo el código: el cuerpo o las cabeceras no se registran.
            logger.warning("Groq respondió HTTP %s; se usa la explicación del backend.", response.status_code)
            return None, "provider_error"

        try:
            content = response.json()["choices"][0]["message"]["content"]
            text = ExplanationText.model_validate(json.loads(content))
        except (ValueError, KeyError, IndexError, TypeError, ValidationError):
            logger.warning("La salida de Groq no pasó la validación; se usa la explicación del backend.")
            return None, "invalid_output"
        invented = invented_numbers(text, facts)
        if invented:
            logger.warning("La salida de Groq trae cifras que no vienen del backend; se descarta.")
            return None, "invalid_output"
        return text, None
