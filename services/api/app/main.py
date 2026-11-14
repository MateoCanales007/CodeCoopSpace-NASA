import os
from typing import Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


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


@app.get("/health", response_model=Health)
def health() -> Health:
    return Health()
