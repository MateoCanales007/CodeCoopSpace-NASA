import os
from datetime import UTC, date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.compare import CompareRequest, CompareResponse, build_comparison
from app.explain import GroqExplainer, Lang
from app.meteomatics import CurrentWeather, MeteomaticsClient, MeteomaticsClimate
from app.power import PowerClient
from app.sites import SITES, SITES_BY_ID, Site

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MAX_CLIMATE_DAYS = 31


class Health(BaseModel):
    status: Literal["ok"] = "ok"


app = FastAPI(title="CodeCoop Space — Field Shift", version="0.1.0")

origins = os.environ.get(
    "FIELD_SHIFT_WEB_ORIGINS", "http://localhost:8081,http://127.0.0.1:8081"
)
# En desarrollo se prueba desde un teléfono en la misma red, y la IP cambia con cada Wi-Fi:
# por defecto se acepta cualquier origen de red privada. La API no usa sesiones ni cookies.
# En un despliegue público, define FIELD_SHIFT_WEB_ORIGIN_REGEX vacío y lista los orígenes exactos.
PRIVATE_NETWORK_ORIGINS = (
    r"^http://(localhost|127\.0\.0\.1|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2})(:\d+)?$"
)
origin_regex = os.environ.get("FIELD_SHIFT_WEB_ORIGIN_REGEX", PRIVATE_NETWORK_ORIGINS).strip() or None
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
    allow_origin_regex=origin_regex,
    allow_methods=["GET", "POST"],
)


@lru_cache
def get_meteomatics_client() -> MeteomaticsClient:
    return MeteomaticsClient.from_env()


@lru_cache
def get_power_client() -> PowerClient:
    return PowerClient.from_env()


@lru_cache
def get_explainer() -> GroqExplainer:
    return GroqExplainer.from_env()


def get_language(accept_language: Annotated[str | None, Header()] = None) -> Lang:
    """Idioma del texto de la respuesta: español si se pide; inglés en cualquier otro caso."""
    return "es" if (accept_language or "").strip().lower().startswith("es") else "en"


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health()


@app.get("/v1/climate/meteomatics", response_model=MeteomaticsClimate)
def meteomatics_climate(
    client: Annotated[MeteomaticsClient, Depends(get_meteomatics_client)],
    latitude: Annotated[float, Query(ge=13.0, le=14.6)] = 13.64,
    longitude: Annotated[float, Query(ge=-90.2, le=-87.5)] = -88.45,
    start: date = date(2024, 5, 1),
    end: date = date(2024, 5, 7),
) -> MeteomaticsClimate:
    if end < start:
        raise HTTPException(422, "end debe ser igual o posterior a start.")
    if (end - start).days + 1 > MAX_CLIMATE_DAYS:
        raise HTTPException(422, f"El periodo máximo es de {MAX_CLIMATE_DAYS} días.")
    if end >= datetime.now(UTC).date():
        raise HTTPException(422, "end debe ser un día pasado; esta ruta es histórica.")
    return client.daily(latitude, longitude, start, end)


@app.get("/v1/weather/current", response_model=CurrentWeather)
def current_weather(
    siteId: str,
    client: Annotated[MeteomaticsClient, Depends(get_meteomatics_client)],
) -> CurrentWeather:
    site = SITES_BY_ID.get(siteId)
    if site is None:
        raise HTTPException(422, "siteId no corresponde a una zona soportada.")
    return client.current_weather(site.approxLat, site.approxLon)


@app.get("/v1/sites", response_model=list[Site])
def sites() -> list[Site]:
    return SITES


@app.post("/v1/compare", response_model=CompareResponse)
def compare(
    request: CompareRequest,
    power: Annotated[PowerClient, Depends(get_power_client)],
    explainer: Annotated[GroqExplainer, Depends(get_explainer)],
    language: Annotated[Lang, Depends(get_language)],
) -> CompareResponse:
    site = SITES_BY_ID.get(request.siteId)
    if site is None:
        raise HTTPException(422, "siteId no corresponde a una zona soportada. Consulta GET /v1/sites.")
    if request.currentCrop not in site.crops:
        raise HTTPException(422, "currentCrop no está disponible para esa zona.")
    # El clima nunca bloquea: si NASA POWER falla, el agua queda sin valorar y se avisa.
    climate = power.season(site.approxLat, site.approxLon)
    return build_comparison(request, site, climate, language, explainer.explain)
