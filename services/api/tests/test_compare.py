import httpx
import pytest
from fastapi.testclient import TestClient

from app.explain import GroqExplainer
from app.main import app, get_explainer, get_power_client
from tests.helpers import power_client, power_down, power_ok

SAN_MIGUEL = "san-miguel"
SONSONATE = "sonsonate"


def request_body(**overrides) -> dict:
    body = {
        "siteId": SAN_MIGUEL,
        "currentCrop": "sorghum",
        "soil": {"texture": "unknown", "drainage": "good"},
        "priorities": ["diversification", "water", "soil"],
    }
    return {**body, **overrides}


@pytest.fixture
def api():
    """API con NASA POWER simulado (3 de 10 años con racha seca) y sin clave de Groq."""
    power, _ = power_client(power_ok(dry_spell_years=3))
    app.dependency_overrides[get_power_client] = lambda: power
    app.dependency_overrides[get_explainer] = lambda: GroqExplainer("")
    yield TestClient(app)
    app.dependency_overrides.clear()


def use_power(handler) -> None:
    power, _ = power_client(handler)
    app.dependency_overrides[get_power_client] = lambda: power


def compare(api: TestClient, language: str = "es", **overrides) -> dict:
    response = api.post("/v1/compare", json=request_body(**overrides), headers={"Accept-Language": language})
    assert response.status_code == 200, response.text
    return response.json()


def levels(scenario: dict) -> dict:
    return {criterion["priority"]: criterion["level"] for criterion in scenario["criteria"]}


def scenario(data: dict, scenario_id: str) -> dict:
    return next(item for item in data["scenarios"] if item["id"] == scenario_id)


def test_sites_lists_supported_areas_with_approximate_points(api):
    sites = api.get("/v1/sites").json()

    assert len(sites) == 14
    assert sites[0] == {
        "id": SAN_MIGUEL,
        "name": "San Miguel",
        "department": "San Miguel",
        "approxLat": 13.64,
        "approxLon": -88.45,
        "crops": ["maize", "bean", "sorghum"],
        "isDemo": False,
    }


def test_compare_returns_current_rotation_and_two_alternatives(api):
    data = compare(api)

    assert [(item["id"], item["role"]) for item in data["scenarios"]] == [
        ("sorghum-sorghum", "current"),
        ("sorghum-maize", "alternative"),
        ("sorghum-bean", "alternative"),
    ]
    assert data["isDemo"] is False
    assert data["methodVersion"].startswith("yago-reglas-")
    assert data["climate"]["status"] == "available"
    assert data["climate"]["period"] == {"start": "2016-05-01", "end": "2025-10-31"}
    assert {metric["id"]: (metric["value"], metric["total"]) for metric in data["climate"]["metrics"]}["drySpellYears"] == (3, 10)
    # Cada criterio enlaza fuentes que vienen en la respuesta.
    source_ids = {source["id"] for source in data["sources"]}
    for item in data["scenarios"]:
        for criterion in item["criteria"]:
            assert criterion["reason"]
            assert set(criterion["evidence"]) <= source_ids
    assert next(source for source in data["sources"] if source["id"] == "nasa-power")["kind"] == "nasa"


def test_good_drainage_highlights_the_legume_for_diversification(api):
    data = compare(api)

    assert data["highlight"]["scenarioId"] == "sorghum-bean"
    assert levels(scenario(data, "sorghum-bean")) == {"diversification": "favorable", "water": "neutral", "soil": "favorable"}
    assert scenario(data, "sorghum-bean")["blocked"] is False


def test_waterlogged_land_rules_out_beans_and_maize_and_says_why(api):
    good = compare(api)
    poor = compare(api, soil={"texture": "unknown", "drainage": "poor"})

    for scenario_id, quote in (("sorghum-bean", "no tolera la acumulación de agua"), ("sorghum-maize", "muy sensible al encharcamiento")):
        item = scenario(poor, scenario_id)
        assert item["blocked"] is True
        assert levels(item)["soil"] == "unfavorable"
        assert quote in item["limitation"]
        assert "centa-guides" in next(criterion for criterion in item["criteria"] if criterion["priority"] == "soil")["evidence"]
    # Solo el maicillo tolera un encharcamiento corto: queda lo que ya hace, y se dice que es lo menos desfavorable.
    assert scenario(poor, "sorghum-sorghum")["blocked"] is False
    assert poor["highlight"]["scenarioId"] == "sorghum-sorghum"
    assert "menos desfavorable" in poor["highlight"]["reason"]
    assert "se encharca" in poor["explanation"]["influence"]
    assert "ninguna alternativa queda bien valorada" in poor["explanation"]["consider"]
    assert "seguir con maicillo" in poor["explanation"]["consider"]
    # El clima y sus métricas no dependen de las respuestas de suelo.
    assert poor["climate"]["metrics"] == good["climate"]["metrics"]


def test_water_reason_cites_nasa_and_the_local_reference(api):
    water = next(criterion for criterion in scenario(compare(api), "sorghum-maize")["criteria"] if criterion["priority"] == "water")

    assert "Ky es 1.25" in water["reason"]
    assert "3 de 10 años (2016–2025)" in water["reason"]
    assert "CENTA indica 500 a 700 mm" in water["reason"]
    assert {"nasa-power", "fao-ky", "centa-guides", "drought-definition"} <= set(water["evidence"])


def test_changing_the_priority_changes_the_highlight_but_not_the_data(api):
    diversify = compare(api)
    water = compare(api, priorities=["water", "soil", "diversification"])

    assert diversify["highlight"]["scenarioId"] == "sorghum-bean"
    # Para cuidar el agua manda el agua: el maicillo es el único que "ayuda" con rachas secas.
    assert water["highlight"] == {**water["highlight"], "scenarioId": "sorghum-sorghum", "priority": "water"}
    assert levels(scenario(water, "sorghum-sorghum"))["water"] == "favorable"
    assert water["climate"]["metrics"] == diversify["climate"]["metrics"]
    assert levels(scenario(water, "sorghum-bean")) == levels(scenario(diversify, "sorghum-bean"))
    assert [criterion["priority"] for criterion in scenario(water, "sorghum-bean")["criteria"]] == ["water", "soil", "diversification"]


def test_sandy_soil_raises_the_water_stress_one_level(api):
    loam = compare(api, currentCrop="maize", soil={"texture": "loam", "drainage": "good"})
    sandy = compare(api, currentCrop="maize", soil={"texture": "sandy", "drainage": "good"})

    assert loam["climate"]["stress"] == "moderate"
    assert sandy["climate"]["stress"] == "high"
    assert levels(scenario(loam, "maize-bean"))["water"] == "neutral"
    assert levels(scenario(sandy, "maize-bean"))["water"] == "unfavorable"
    assert levels(scenario(sandy, "maize-sorghum"))["water"] == "favorable"


def test_not_sure_answers_are_listed_as_still_to_confirm(api):
    data = compare(api, soil={"texture": "unknown", "drainage": "unknown"})

    bean = scenario(data, "sorghum-bean")
    assert "textura" in bean["missingData"] and "se encharca" in bean["missingData"]
    assert any("Falta confirmar" in warning for warning in data["warnings"])
    assert "confirme" in data["explanation"]["verify"]
    # Sin saber el drenaje no se castiga ni se descarta ninguna opción.
    assert bean["blocked"] is False


def test_area_without_dry_spells_has_no_water_alert(api):
    use_power(power_ok(dry_spell_years=0))

    data = compare(api, siteId=SONSONATE)

    assert data["climate"]["stress"] == "low"
    assert data["climate"]["alert"] is None
    assert levels(scenario(data, "sorghum-maize"))["water"] == "neutral"


def test_without_nasa_data_water_is_undetermined_and_the_rest_still_answers(api):
    use_power(power_down)

    data = compare(api, siteId=SONSONATE)

    assert data["climate"]["status"] == "unavailable"
    assert data["isDemo"] is False
    for item in data["scenarios"]:
        water = next(criterion for criterion in item["criteria"] if criterion["priority"] == "water")
        assert (water["status"], water["level"]) == ("undetermined", None)
    assert levels(scenario(data, "sorghum-bean"))["soil"] == "favorable"
    assert any("NASA POWER" in warning for warning in data["warnings"])
    assert all(metric["value"] is None and metric["reason"] for metric in data["climate"]["metrics"])


def test_saved_sample_is_labelled_as_demo_and_only_for_its_site(api):
    use_power(power_down)

    data = compare(api, siteId=SAN_MIGUEL)

    assert data["isDemo"] is True
    assert data["climate"]["kind"] == "saved-sample"
    assert data["climate"]["period"] == {"start": "2024-05-01", "end": "2024-05-07"}
    assert data["warnings"][0].startswith("Modo demo")
    assert levels(scenario(data, "sorghum-bean"))["water"] is None


def test_text_follows_accept_language(api):
    spanish = compare(api, "es-SV")
    english = compare(api, "en")

    assert "Sembrar frijol después de maicillo" in scenario(spanish, "sorghum-bean")["summary"]
    assert "Sow beans after sorghum" in scenario(english, "sorghum-bean")["summary"]
    assert levels(scenario(spanish, "sorghum-bean")) == levels(scenario(english, "sorghum-bean"))


def test_explanation_comes_from_the_rules_when_groq_is_not_configured(api):
    explanation = compare(api)["explanation"]

    assert (explanation["source"], explanation["fallbackReason"], explanation["model"]) == ("rules", "not_configured", None)
    assert "Maicillo → Frijol" in explanation["consider"]


def test_groq_only_words_the_calculated_result(api):
    written = {
        "consider": "Para diversificar, piense en sembrar frijol después del maicillo.",
        "influence": "Pesó que usted quiere diversificar y que en 3 de 10 años faltó la lluvia.",
        "caution": "El frijol sufre más cuando falta el agua.",
        "verify": "Confirme la textura de su tierra y hable con un técnico.",
    }
    seen: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        seen.append(request)
        return httpx.Response(200, json={"choices": [{"message": {"content": __import__("json").dumps(written)}}]})

    app.dependency_overrides[get_explainer] = lambda: GroqExplainer("gsk_prueba", "openai/gpt-oss-20b", transport=httpx.MockTransport(handler))

    with_groq = compare(api)
    app.dependency_overrides[get_explainer] = lambda: GroqExplainer("")
    without_groq = compare(api)

    assert (with_groq["explanation"]["source"], with_groq["explanation"]["model"]) == ("groq", "openai/gpt-oss-20b")
    assert with_groq["explanation"]["consider"] == written["consider"]
    # Cultivos, valoraciones, fuentes y opción destacada no cambian con o sin el modelo.
    for key in ("scenarios", "highlight", "sources", "climate"):
        assert with_groq[key] == without_groq[key]
    assert "gsk_prueba" not in str(with_groq)
    assert len(seen) == 1


def test_groq_failure_keeps_the_comparison_with_the_backend_explanation(api):
    app.dependency_overrides[get_explainer] = lambda: GroqExplainer(
        "gsk_prueba", transport=httpx.MockTransport(lambda request: httpx.Response(429, json={"error": {"message": "limit"}}))
    )

    data = compare(api)

    assert (data["explanation"]["source"], data["explanation"]["fallbackReason"]) == ("rules", "rate_limited")
    assert data["highlight"]["scenarioId"] == "sorghum-bean"
    assert len(data["scenarios"]) == 3


@pytest.mark.parametrize(
    "overrides",
    [
        {"priorities": ["water", "water", "soil"]},
        {"priorities": ["water", "soil"]},
        {"priorities": ["water", "soil", "yield"]},
        {"siteId": "does-not-exist"},
        {"currentCrop": "rice"},
        {"soil": {"texture": "rocky", "drainage": "good"}},
    ],
)
def test_invalid_input_is_rejected_with_422(api, overrides):
    assert api.post("/v1/compare", json=request_body(**overrides)).status_code == 422
