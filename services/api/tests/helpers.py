"""Datos sintéticos para las pruebas. Ninguna prueba usa la red ni credenciales."""

from datetime import date, timedelta

import httpx

from app.power import PowerClient

FIRST_YEAR, LAST_YEAR = 2016, 2025
TODAY = date(2026, 11, 15)


def power_payload(dry_spell_years: int = 3, fill_years: tuple[int, ...] = ()) -> dict:
    """Respuesta diaria de POWER: llueve 8 mm cada día, salvo las rachas secas pedidas.

    Los primeros `dry_spell_years` años tienen 6 días secos seguidos en julio.
    Los años de `fill_years` traen el valor de relleno en agosto.
    """
    rain, tmax = {}, {}
    day = date(FIRST_YEAR, 5, 1)
    while day <= date(LAST_YEAR, 10, 31):
        key = f"{day:%Y%m%d}"
        value = 8.0
        if day.year - FIRST_YEAR < dry_spell_years and day.month == 7 and 10 <= day.day <= 15:
            value = 0.2
        if day.year in fill_years and day.month == 8:
            value = -999.0
        rain[key] = value
        tmax[key] = 31.0
        day += timedelta(days=1)
    return {
        "header": {"api": {"version": "v2.10.3"}, "sources": ["MERRA2", "POWER"], "fill_value": -999.0, "time_standard": "LST"},
        "properties": {"parameter": {"PRECTOTCORR": rain, "T2M_MAX": tmax}},
    }


class Recorder:
    def __init__(self, handler):
        self.handler = handler
        self.requests: list[httpx.Request] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        return self.handler(request)


def power_client(handler, **kwargs) -> tuple[PowerClient, Recorder]:
    recorder = Recorder(handler)
    kwargs.setdefault("today", lambda: TODAY)
    return PowerClient(transport=httpx.MockTransport(recorder), **kwargs), recorder


def power_ok(dry_spell_years: int = 3, **kwargs):
    return lambda request: httpx.Response(200, json=power_payload(dry_spell_years, **kwargs))


def power_down(request: httpx.Request) -> httpx.Response:
    raise httpx.ConnectError("sin red", request=request)
