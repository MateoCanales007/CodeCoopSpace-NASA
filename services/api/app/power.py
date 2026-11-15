"""Contexto climático histórico de NASA POWER para un punto aproximado.

Consulta la API diaria de POWER (pública, sin credenciales), resume la época
lluviosa de los últimos años completos y guarda una copia en disco. Si POWER
falla se usa esa copia etiquetada como tal; si no existe, la muestra guardada
del repositorio solo para el punto al que corresponde.
"""

import json
import os
import threading
import time
from collections.abc import Callable
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Literal

import httpx
from pydantic import BaseModel

BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
PARAMETERS = "T2M_MAX,PRECTOTCORR"
TIMEOUT_SECONDS = 20.0
CACHE_TTL_SECONDS = 24 * 60 * 60

# Ventanas y umbrales del método (ver docs/DATOS-Y-METODO.md).
YEARS = 10
SEASON_MONTHS = (5, 10)  # época lluviosa: mayo a octubre
DRY_SPELL_MONTHS = (7, 8)  # ventana de la canícula: julio y agosto
DRY_DAY_MM = 1.0  # un día con menos de 1 mm cuenta como seco
DRY_SPELL_DAYS = 5  # racha seca: 5 o más días secos seguidos
MIN_SEASON_COVERAGE = 0.95  # un año cuenta si tiene al menos 95 % de días válidos
MIN_VALID_YEARS = 5

SAMPLE_PATH = Path(__file__).resolve().parents[3] / "data" / "samples" / "power-san-miguel-2024-05.json"

Kind = Literal["season-history", "saved-sample"]


class YearSummary(BaseModel):
    year: int
    seasonRainMm: float
    longestDrySpellDays: int


class PowerClimate(BaseModel):
    """Resumen reproducible: cada cifra sale de los valores diarios de POWER."""

    status: Literal["available", "partial", "unavailable"]
    kind: Kind = "season-history"
    reason: str | None = None
    start: date
    end: date
    validDays: int = 0
    expectedDays: int = 0
    years: list[YearSummary] = []
    seasonRainMeanMm: float | None = None
    seasonRainMinMm: float | None = None
    seasonRainMaxMm: float | None = None
    drySpellYears: int | None = None
    drySpellMeanDays: float | None = None
    tMaxMeanC: float | None = None
    # Solo para la muestra guardada de una semana.
    sampleRainMm: float | None = None
    sampleDryDays: int | None = None
    url: str | None = None
    apiVersion: str | None = None
    dataSources: list[str] = []
    timeStandard: str | None = None
    retrievedAt: datetime | None = None
    stale: bool = False


def _daterange(start: date, end: date):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def _month_end(year: int, month: int) -> date:
    return (date(year + (month == 12), month % 12 + 1, 1)) - timedelta(days=1)


def _longest_dry_run(values: list[float]) -> int:
    best = run = 0
    for value in values:
        run = run + 1 if value < DRY_DAY_MM else 0
        best = max(best, run)
    return best


def summarize(payload: dict, first_year: int, last_year: int, url: str, retrieved_at: datetime) -> PowerClimate:
    """Convierte la respuesta diaria de POWER en el resumen de época lluviosa."""
    header = payload["header"]
    fill = float(header.get("fill_value", -999.0))
    rain = payload["properties"]["parameter"]["PRECTOTCORR"]
    tmax = payload["properties"]["parameter"]["T2M_MAX"]

    def value(series: dict, day: date) -> float | None:
        raw = series.get(f"{day:%Y%m%d}")
        if isinstance(raw, bool) or not isinstance(raw, (int, float)) or raw == fill:
            return None
        return float(raw)

    years: list[YearSummary] = []
    highs: list[float] = []
    valid_days = expected_days = 0
    for year in range(first_year, last_year + 1):
        season = list(_daterange(date(year, SEASON_MONTHS[0], 1), _month_end(year, SEASON_MONTHS[1])))
        season_rain = [value(rain, day) for day in season]
        present = [item for item in season_rain if item is not None]
        expected_days += len(season)
        valid_days += len(present)
        spell_window = [
            value(rain, day)
            for day in _daterange(date(year, DRY_SPELL_MONTHS[0], 1), _month_end(year, DRY_SPELL_MONTHS[1]))
        ]
        # Un día sin dato no es un día sin lluvia: el año se descarta en vez de rellenarlo.
        if len(present) / len(season) < MIN_SEASON_COVERAGE or any(item is None for item in spell_window):
            continue
        years.append(
            YearSummary(
                year=year,
                seasonRainMm=round(sum(present), 1),
                longestDrySpellDays=_longest_dry_run([item for item in spell_window if item is not None]),
            )
        )
        highs.extend(item for item in (value(tmax, day) for day in season) if item is not None)

    base = dict(
        start=date(first_year, SEASON_MONTHS[0], 1),
        end=_month_end(last_year, SEASON_MONTHS[1]),
        validDays=valid_days,
        expectedDays=expected_days,
        url=url,
        apiVersion=header.get("api", {}).get("version"),
        dataSources=list(header.get("sources", [])),
        timeStandard=header.get("time_standard"),
        retrievedAt=retrieved_at,
    )
    if len(years) < MIN_VALID_YEARS:
        return PowerClimate(status="unavailable", reason="insufficient_coverage", **base)

    totals = [item.seasonRainMm for item in years]
    spells = [item.longestDrySpellDays for item in years]
    return PowerClimate(
        status="available" if len(years) == last_year - first_year + 1 else "partial",
        years=years,
        seasonRainMeanMm=round(sum(totals) / len(totals)),
        seasonRainMinMm=round(min(totals)),
        seasonRainMaxMm=round(max(totals)),
        drySpellYears=sum(spell >= DRY_SPELL_DAYS for spell in spells),
        drySpellMeanDays=round(sum(spells) / len(spells), 1),
        tMaxMeanC=round(sum(highs) / len(highs), 1) if highs else None,
        **base,
    )


def load_sample(latitude: float, longitude: float) -> PowerClimate | None:
    """Muestra histórica de una semana, válida únicamente para su propio punto."""
    try:
        sample = json.loads(SAMPLE_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    provenance = sample.get("provenance", {})
    if round(provenance.get("latitude", 999), 2) != round(latitude, 2) or round(provenance.get("longitude", 999), 2) != round(longitude, 2):
        return None
    fill = provenance.get("fillValue", -999.0)
    days = sample.get("days", [])
    rain = [day["precipMmPerDay"] for day in days if day.get("precipMmPerDay") not in (None, fill)]
    highs = [day["tMaxC"] for day in days if day.get("tMaxC") not in (None, fill)]
    if not days or not rain:
        return None
    return PowerClimate(
        status="partial",
        kind="saved-sample",
        reason="saved_sample",
        start=date.fromisoformat(days[0]["date"]),
        end=date.fromisoformat(days[-1]["date"]),
        validDays=len(rain),
        expectedDays=len(days),
        sampleRainMm=round(sum(rain), 1),
        sampleDryDays=sum(value < DRY_DAY_MM for value in rain),
        tMaxMeanC=round(sum(highs) / len(highs), 1) if highs else None,
        url=provenance.get("url"),
        apiVersion=provenance.get("apiVersion"),
        dataSources=list(provenance.get("sources", [])),
        timeStandard=provenance.get("timeStandard"),
        retrievedAt=datetime.fromisoformat(provenance["retrievedDate"]).replace(tzinfo=UTC) if provenance.get("retrievedDate") else None,
    )


class PowerClient:
    def __init__(
        self,
        *,
        base_url: str = BASE_URL,
        transport: httpx.BaseTransport | None = None,
        timeout: float = TIMEOUT_SECONDS,
        cache_dir: Path | None = None,
        cache_ttl: float = CACHE_TTL_SECONDS,
        clock: Callable[[], float] = time.monotonic,
        today: Callable[[], date] = lambda: datetime.now(UTC).date(),
        use_sample: bool = True,
    ) -> None:
        self._base_url = base_url
        self._transport = transport
        self._timeout = timeout
        self._cache_dir = cache_dir
        self._cache_ttl = cache_ttl
        self._clock = clock
        self._today = today
        self._use_sample = use_sample
        self._cache: dict[tuple, tuple[float, PowerClimate]] = {}
        self._lock = threading.Lock()

    @classmethod
    def from_env(cls) -> "PowerClient":
        default_dir = Path(__file__).resolve().parent.parent / ".cache" / "power"
        return cls(cache_dir=Path(os.environ.get("FIELD_SHIFT_CACHE_DIR", default_dir)))

    def period(self) -> tuple[int, int]:
        """Últimos años con la época lluviosa completa."""
        last_year = self._today().year - 1
        return last_year - YEARS + 1, last_year

    def build_url(self, latitude: float, longitude: float, first_year: int, last_year: int) -> str:
        start = date(first_year, SEASON_MONTHS[0], 1)
        end = _month_end(last_year, SEASON_MONTHS[1])
        return (
            f"{self._base_url}?parameters={PARAMETERS}&community=AG"
            f"&longitude={longitude}&latitude={latitude}&start={start:%Y%m%d}&end={end:%Y%m%d}&format=JSON"
        )

    def season(self, latitude: float, longitude: float) -> PowerClimate:
        first_year, last_year = self.period()
        key = (round(latitude, 2), round(longitude, 2), first_year, last_year)
        with self._lock:
            cached = self._cache.get(key)
        if cached and self._clock() - cached[0] < self._cache_ttl:
            return cached[1]

        url = self.build_url(latitude, longitude, first_year, last_year)
        result = self._fetch(url, first_year, last_year)
        if result.status != "unavailable":
            with self._lock:
                self._cache[key] = (self._clock(), result)
            self._write_disk(key, result)
            return result

        # POWER falló: primero una copia guardada del mismo punto y periodo.
        copy = cached[1] if cached else self._read_disk(key)
        if copy:
            return copy.model_copy(update={"stale": True})
        if self._use_sample:
            sample = load_sample(latitude, longitude)
            if sample:
                return sample
        return result

    def _fetch(self, url: str, first_year: int, last_year: int) -> PowerClimate:
        empty = dict(start=date(first_year, SEASON_MONTHS[0], 1), end=_month_end(last_year, SEASON_MONTHS[1]), url=url)
        try:
            with httpx.Client(timeout=self._timeout, transport=self._transport) as client:
                response = client.get(url)
        except httpx.TimeoutException:
            return PowerClimate(status="unavailable", reason="timeout", **empty)
        except httpx.HTTPError:
            return PowerClimate(status="unavailable", reason="upstream_error", **empty)
        if response.status_code != 200:
            return PowerClimate(status="unavailable", reason="upstream_error", **empty)
        try:
            return summarize(response.json(), first_year, last_year, url, datetime.now(UTC).replace(microsecond=0))
        except (ValueError, KeyError, TypeError):
            return PowerClimate(status="unavailable", reason="invalid_response", **empty)

    def _disk_path(self, key: tuple) -> Path | None:
        if not self._cache_dir:
            return None
        latitude, longitude, first_year, last_year = key
        return self._cache_dir / f"power_{latitude}_{longitude}_{first_year}_{last_year}.json"

    def _write_disk(self, key: tuple, result: PowerClimate) -> None:
        path = self._disk_path(key)
        if not path:
            return
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(result.model_dump_json(), encoding="utf-8")
        except OSError:
            pass

    def _read_disk(self, key: tuple) -> PowerClimate | None:
        path = self._disk_path(key)
        if not path:
            return None
        try:
            return PowerClimate.model_validate_json(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return None
