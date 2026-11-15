import os
from datetime import UTC, date, datetime
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.meteomatics import MeteomaticsClient, MeteomaticsClimate

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MAX_CLIMATE_DAYS = 31


class Health(BaseModel):
    status: Literal["ok"] = "ok"


app = FastAPI(title="CodeCoop Space — Field Shift", version="0.1.0")

origins = os.environ.get(
    "FIELD_SHIFT_WEB_ORIGINS", "http://localhost:8081,http://127.0.0.1:8081"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
    allow_methods=["GET", "POST"],
)


@lru_cache
def get_meteomatics_client() -> MeteomaticsClient:
    return MeteomaticsClient.from_env()


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
