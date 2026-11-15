import base64
from datetime import date

import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app, get_meteomatics_client
from app.meteomatics import MeteomaticsClient

START, END = date(2024, 5, 1), date(2024, 5, 3)


def payload(tmax=(33.9, 32.5, 34.0), tmin=(25.9, 26.2, 25.4), precip=(3.3, 8.8, 0.5)):
    stamps = ["2024-05-02T00:00:00Z", "2024-05-03T00:00:00Z", "2024-05-04T00:00:00Z"]

    def series(parameter, values):
        dates = [{"date": s, "value": v} for s, v in zip(stamps, values)]
        return {"parameter": parameter, "coordinates": [{"lat": 13.64, "lon": -88.45, "dates": dates}]}

    return {
        "version": "3.0",
        "status": "OK",
        "data": [
            series("t_max_2m_24h:C", tmax),
            series("t_min_2m_24h:C", tmin),
            series("precip_24h:mm", precip),
        ],
    }


class Recorder:
    def __init__(self, handler):
        self.handler = handler
        self.requests: list[httpx.Request] = []

    def __call__(self, request: httpx.Request) -> httpx.Response:
        self.requests.append(request)
        return self.handler(request)


def make_client(handler, **kwargs) -> tuple[MeteomaticsClient, Recorder]:
    recorder = Recorder(handler)
    client = MeteomaticsClient(
        kwargs.pop("username", "demo-user"),
        kwargs.pop("password", "demo-pass"),
        transport=httpx.MockTransport(recorder),
        **kwargs,
    )
    return client, recorder


@pytest.fixture
def api():
    def use(client: MeteomaticsClient) -> TestClient:
        app.dependency_overrides[get_meteomatics_client] = lambda: client
        return TestClient(app)

    yield use
    app.dependency_overrides.clear()


def get(api_client: TestClient, **params):
    query = {"start": "2024-05-01", "end": "2024-05-03", **params}
    return api_client.get("/v1/climate/meteomatics", params=query)


def test_available_series_with_provenance(api):
    client, recorder = make_client(lambda r: httpx.Response(200, json=payload()))
    body = get(api(client)).json()

    assert body["status"] == "available"
    assert body["coverage"] == {"validDays": 3, "expectedDays": 3}
    assert body["days"][0] == {"date": "2024-05-01", "tMaxC": 33.9, "tMinC": 25.9, "precipMm": 3.3}
    assert body["units"]["precipMm"] == "mm"

    request = recorder.requests[0]
    assert request.url.path == (
        "/2024-05-02T00:00:00Z--2024-05-04T00:00:00Z:P1D/"
        "t_max_2m_24h:C,t_min_2m_24h:C,precip_24h:mm/13.64,-88.45/json"
    )
    expected = base64.b64encode(b"demo-user:demo-pass").decode()
    assert request.headers["authorization"] == f"Basic {expected}"
    assert "demo-pass" not in body["provenance"]["url"]
    assert body["provenance"]["retrievedAt"].endswith("Z")


def test_fill_value_is_missing_not_zero(api):
    client, _ = make_client(lambda r: httpx.Response(200, json=payload(precip=(3.3, -999, 0.0))))
    body = get(api(client)).json()

    assert body["status"] == "partial"
    assert body["coverage"] == {"validDays": 2, "expectedDays": 3}
    assert body["days"][1]["precipMm"] is None
    assert body["days"][2]["precipMm"] == 0.0


def test_not_configured_skips_network(api):
    client, recorder = make_client(lambda r: httpx.Response(200), username="", password="")
    response = get(api(client))

    assert response.status_code == 200
    assert response.json()["status"] == "unavailable"
    assert response.json()["reason"] == "not_configured"
    assert recorder.requests == []


@pytest.mark.parametrize(
    "handler, reason",
    [
        (lambda r: httpx.Response(401), "auth_failed"),
        (lambda r: httpx.Response(500), "upstream_error"),
        (lambda r: httpx.Response(200, text="no json"), "invalid_response"),
        (lambda r: (_ for _ in ()).throw(httpx.ReadTimeout("slow", request=r)), "timeout"),
        (lambda r: (_ for _ in ()).throw(httpx.ConnectError("down", request=r)), "upstream_error"),
    ],
)
def test_failures_degrade_to_unavailable(api, handler, reason):
    client, _ = make_client(handler)
    response = get(api(client))

    assert response.status_code == 200
    body = response.json()
    assert (body["status"], body["reason"], body["days"]) == ("unavailable", reason, [])
    assert body["message"]


def test_cache_and_stale_copy_on_failure():
    now = [0.0]
    responses = [httpx.Response(200, json=payload()), httpx.Response(503)]
    client, recorder = make_client(lambda r: responses.pop(0), cache_ttl=60, clock=lambda: now[0])

    first = client.daily(13.64, -88.45, START, END)
    assert client.daily(13.64, -88.45, START, END) is first
    assert len(recorder.requests) == 1

    now[0] = 120
    stale = client.daily(13.64, -88.45, START, END)
    assert len(recorder.requests) == 2
    assert stale.stale is True
    assert stale.status == "available"
    assert stale.provenance.retrievedAt == first.provenance.retrievedAt


@pytest.mark.parametrize(
    "params",
    [
        {"start": "2024-05-03", "end": "2024-05-01"},
        {"start": "2024-01-01", "end": "2024-03-01"},
        {"latitude": "40.0"},
        {"longitude": "-70.0"},
        {"start": "2024-05-01", "end": "2999-01-01"},
    ],
)
def test_invalid_input_is_422(api, params):
    client, recorder = make_client(lambda r: httpx.Response(200, json=payload()))
    assert get(api(client), **params).status_code == 422
    assert recorder.requests == []


def test_health_does_not_depend_on_meteomatics(api):
    client, _ = make_client(lambda r: httpx.Response(500), username="", password="")
    assert api(client).get("/health").json() == {"status": "ok"}
