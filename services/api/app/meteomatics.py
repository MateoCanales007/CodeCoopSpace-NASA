"""Clima complementario de Meteomatics, consultado solo desde el servidor.

La comparación basada en NASA no depende de este módulo: cualquier fallo se
devuelve como estado `unavailable` con una causa legible, nunca como excepción.
"""

import math
import os
import threading
import time
from collections.abc import Callable
from datetime import UTC, date, datetime, timedelta
from typing import Literal

import httpx
from pydantic import BaseModel

BASE_URL = "https://api.meteomatics.com"
PARAMETERS = {
    "tMaxC": "t_max_2m_24h:C",
    "tMinC": "t_min_2m_24h:C",
    "precipMm": "precip_24h:mm",
}
UNITS = {"tMaxC": "degC", "tMinC": "degC", "precipMm": "mm"}
FILL_VALUE = -999.0
TIMEOUT_SECONDS = 10.0
CACHE_TTL_SECONDS = 6 * 60 * 60

Reason = Literal[
    "not_configured", "auth_failed", "timeout", "upstream_error", "invalid_response"
]

REASON_MESSAGES: dict[str, str] = {
    "not_configured": "Meteomatics no está configurado en el servidor.",
    "auth_failed": "Meteomatics rechazó las credenciales o la oferta expiró.",
    "timeout": "Meteomatics no respondió a tiempo.",
    "upstream_error": "Meteomatics devolvió un error.",
    "invalid_response": "La respuesta de Meteomatics no tiene el formato esperado.",
}


class MeteomaticsDay(BaseModel):
    date: date
    tMaxC: float | None
    tMinC: float | None
    precipMm: float | None


class MeteomaticsProvenance(BaseModel):
    product: str = "Meteomatics Weather API"
    model: str = "mix (selección por defecto de Meteomatics)"
    url: str
    parameters: list[str]
    retrievedAt: datetime
    latitude: float
    longitude: float
    timeStandard: str = "UTC"
    aggregation: str = (
        "Cada día D agrega las 24 h de D entre 00:00 y 24:00 UTC "
        "(valor *_24h con marca de tiempo D+1 00:00Z)."
    )
    fillValue: float = FILL_VALUE
    use: str = "Clima complementario; la comparación usa NASA como fuente principal."


class WeatherPoint(BaseModel):
    validAt: datetime
    temperatureC: float | None
    rainMm: float | None = None


class CurrentWeather(BaseModel):
    source: Literal["meteomatics"] = "meteomatics"
    status: Literal["available", "partial", "unavailable"]
    reason: Reason | None = None
    current: WeatherPoint | None = None
    forecast: list[WeatherPoint] = []


class Coverage(BaseModel):
    validDays: int
    expectedDays: int


class MeteomaticsClimate(BaseModel):
    source: Literal["meteomatics"] = "meteomatics"
    status: Literal["available", "partial", "unavailable"]
    reason: Reason | None = None
    message: str | None = None
    start: date
    end: date
    units: dict[str, str] = UNITS
    coverage: Coverage
    days: list[MeteomaticsDay]
    provenance: MeteomaticsProvenance | None = None
    stale: bool = False


def _unavailable(start: date, end: date, reason: Reason, detail: str = "") -> MeteomaticsClimate:
    message = REASON_MESSAGES[reason] + (f" {detail}" if detail else "")
    return MeteomaticsClimate(
        status="unavailable",
        reason=reason,
        message=message,
        start=start,
        end=end,
        coverage=Coverage(validDays=0, expectedDays=(end - start).days + 1),
        days=[],
    )


def _clean(value: object) -> float | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    if value == FILL_VALUE or not math.isfinite(value):
        return None
    return float(value)


class MeteomaticsClient:
    def __init__(
        self,
        username: str,
        password: str,
        *,
        base_url: str = BASE_URL,
        transport: httpx.BaseTransport | None = None,
        timeout: float = TIMEOUT_SECONDS,
        cache_ttl: float = CACHE_TTL_SECONDS,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self._username = username
        self._password = password
        self._base_url = base_url.rstrip("/")
        self._transport = transport
        self._timeout = timeout
        self._cache_ttl = cache_ttl
        self._clock = clock
        self._cache: dict[tuple, tuple[float, MeteomaticsClimate]] = {}
        self._current_cache: dict[tuple[float, float], tuple[datetime, CurrentWeather]] = {}
        self._lock = threading.Lock()

    @classmethod
    def from_env(cls) -> "MeteomaticsClient":
        return cls(
            os.environ.get("METEOMATICS_USERNAME", "").strip(),
            os.environ.get("METEOMATICS_PASSWORD", "").strip(),
        )

    @property
    def configured(self) -> bool:
        return bool(self._username and self._password)

    def _request_json(self, url: str) -> tuple[dict | None, Reason | None]:
        try:
            with httpx.Client(
                auth=(self._username, self._password),
                timeout=self._timeout,
                transport=self._transport,
            ) as client:
                response = client.get(url)
        except httpx.TimeoutException:
            return None, "timeout"
        except httpx.HTTPError:
            return None, "upstream_error"

        if response.status_code in (401, 403):
            return None, "auth_failed"
        if response.status_code != 200:
            return None, "upstream_error"
        try:
            payload = response.json()
        except ValueError:
            return None, "invalid_response"
        if not isinstance(payload, dict) or payload.get("status") != "OK":
            return None, "invalid_response"
        return payload, None

    def current_weather(self, latitude: float, longitude: float) -> CurrentWeather:
        if not self.configured:
            return CurrentWeather(status="unavailable", reason="not_configured")

        now = datetime.now(UTC)
        base = now.replace(minute=now.minute // 15 * 15, second=0, microsecond=0)
        key = (latitude, longitude)
        with self._lock:
            cached = self._current_cache.get(key)
        if cached and cached[0] == base:
            return cached[1]

        stamps = [base + timedelta(hours=hours) for hours in (0, 6, 12, 18, 24)]
        period = ",".join(stamp.strftime("%Y-%m-%dT%H:%M:%SZ") for stamp in stamps)
        url = f"{self._base_url}/{period}/t_2m:C,precip_6h:mm/{latitude},{longitude}/json"
        payload, reason = self._request_json(url)
        if payload is None:
            return CurrentWeather(status="unavailable", reason=reason)

        try:
            values = {
                parameter["parameter"]: {
                    datetime.fromisoformat(entry["date"].replace("Z", "+00:00")): _clean(entry["value"])
                    for entry in parameter["coordinates"][0]["dates"]
                }
                for parameter in payload["data"]
            }
        except (ValueError, KeyError, IndexError, TypeError, AttributeError):
            return CurrentWeather(status="unavailable", reason="invalid_response")

        temperatures = values.get("t_2m:C", {})
        rainfall = values.get("precip_6h:mm", {})
        now_temp = temperatures.get(base)
        current = WeatherPoint(validAt=base, temperatureC=now_temp) if now_temp is not None else None
        forecast = [
            WeatherPoint(validAt=stamp, temperatureC=temperatures.get(stamp), rainMm=rainfall.get(stamp))
            for stamp in stamps[1:]
        ]
        forecast = [point for point in forecast if point.temperatureC is not None or point.rainMm is not None]
        if current is None and not forecast:
            return CurrentWeather(status="unavailable", reason="invalid_response")

        complete = current is not None and len(forecast) == 4 and all(
            point.temperatureC is not None and point.rainMm is not None for point in forecast
        )
        result = CurrentWeather(status="available" if complete else "partial", current=current, forecast=forecast)
        with self._lock:
            self._current_cache[key] = (base, result)
        return result

    def build_url(self, latitude: float, longitude: float, start: date, end: date) -> str:
        first = datetime.combine(start + timedelta(days=1), datetime.min.time())
        last = datetime.combine(end + timedelta(days=1), datetime.min.time())
        period = f"{first:%Y-%m-%dT%H:%M:%SZ}--{last:%Y-%m-%dT%H:%M:%SZ}:P1D"
        parameters = ",".join(PARAMETERS.values())
        return f"{self._base_url}/{period}/{parameters}/{latitude},{longitude}/json"

    def daily(
        self, latitude: float, longitude: float, start: date, end: date
    ) -> MeteomaticsClimate:
        if not self.configured:
            return _unavailable(start, end, "not_configured")

        key = (round(latitude, 4), round(longitude, 4), start, end)
        with self._lock:
            cached = self._cache.get(key)
        if cached and self._clock() - cached[0] < self._cache_ttl:
            return cached[1]

        result = self._fetch(latitude, longitude, start, end)
        if result.status != "unavailable":
            with self._lock:
                self._cache[key] = (self._clock(), result)
            return result
        if cached:
            return cached[1].model_copy(update={"stale": True, "message": result.message})
        return result

    def _fetch(
        self, latitude: float, longitude: float, start: date, end: date
    ) -> MeteomaticsClimate:
        url = self.build_url(latitude, longitude, start, end)
        payload, reason = self._request_json(url)
        if payload is None:
            return _unavailable(start, end, reason or "invalid_response")
        try:
            values = self._parse(payload)
        except (ValueError, KeyError, IndexError, TypeError, AttributeError):
            return _unavailable(start, end, "invalid_response")

        days: list[MeteomaticsDay] = []
        current = start
        while current <= end:
            row = values.get(current, {})
            days.append(
                MeteomaticsDay(date=current, **{field: row.get(field) for field in PARAMETERS})
            )
            current += timedelta(days=1)

        valid = sum(
            all(getattr(day, field) is not None for field in PARAMETERS) for day in days
        )
        if valid == 0:
            return _unavailable(start, end, "invalid_response", "Sin valores válidos.")

        return MeteomaticsClimate(
            status="available" if valid == len(days) else "partial",
            start=start,
            end=end,
            coverage=Coverage(validDays=valid, expectedDays=len(days)),
            days=days,
            provenance=MeteomaticsProvenance(
                url=url,
                parameters=list(PARAMETERS.values()),
                retrievedAt=datetime.now(UTC).replace(microsecond=0),
                latitude=latitude,
                longitude=longitude,
            ),
        )

    @staticmethod
    def _parse(payload: dict) -> dict[date, dict[str, float | None]]:
        if payload.get("status") != "OK":
            raise ValueError("status")
        by_parameter = {item["parameter"]: item for item in payload["data"]}
        values: dict[date, dict[str, float | None]] = {}
        for field, parameter in PARAMETERS.items():
            for entry in by_parameter[parameter]["coordinates"][0]["dates"]:
                stamp = datetime.fromisoformat(entry["date"].replace("Z", "+00:00"))
                day = stamp.date() - timedelta(days=1)
                values.setdefault(day, {})[field] = _clean(entry["value"])
        return values
