from datetime import date

from app.power import summarize
from tests.helpers import FIRST_YEAR, LAST_YEAR, power_client, power_down, power_ok, power_payload

SAMPLE_POINT = (13.64, -88.45)
OTHER_POINT = (13.72, -89.72)


def test_summary_counts_dry_spell_years_and_season_rain():
    climate = summarize(power_payload(dry_spell_years=3), FIRST_YEAR, LAST_YEAR, "url", None)

    assert climate.status == "available"
    assert (climate.start, climate.end) == (date(2016, 5, 1), date(2025, 10, 31))
    assert len(climate.years) == 10
    assert climate.drySpellYears == 3
    # 184 días de mayo a octubre: 178 con 8 mm y 6 con 0.2 mm.
    assert climate.years[0].seasonRainMm == 178 * 8 + 6 * 0.2
    assert climate.years[0].longestDrySpellDays == 6
    assert climate.years[-1].longestDrySpellDays == 0
    assert climate.tMaxMeanC == 31.0
    assert (climate.validDays, climate.expectedDays) == (1840, 1840)


def test_fill_values_are_missing_data_not_dry_days():
    climate = summarize(power_payload(dry_spell_years=0, fill_years=(2020, 2021)), FIRST_YEAR, LAST_YEAR, "url", None)

    # Agosto sin dato no cuenta como racha seca: esos años se descartan y baja la cobertura.
    assert climate.status == "partial"
    assert [item.year for item in climate.years] == [2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025]
    assert climate.drySpellYears == 0
    assert climate.validDays == 1840 - 2 * 31


def test_too_few_valid_years_is_unavailable():
    climate = summarize(power_payload(fill_years=tuple(range(2016, 2022))), FIRST_YEAR, LAST_YEAR, "url", None)

    assert climate.status == "unavailable"
    assert climate.reason == "insufficient_coverage"
    assert climate.drySpellYears is None


def test_request_asks_for_the_last_ten_rainy_seasons():
    client, recorder = power_client(power_ok())

    client.season(*OTHER_POINT)

    params = recorder.requests[0].url.params
    assert (params["start"], params["end"]) == ("20160501", "20251031")
    assert (params["latitude"], params["longitude"]) == ("13.72", "-89.72")
    assert params["parameters"] == "T2M_MAX,PRECTOTCORR"


def test_result_is_cached_in_memory():
    client, recorder = power_client(power_ok())

    first = client.season(*OTHER_POINT)
    second = client.season(*OTHER_POINT)

    assert first == second
    assert len(recorder.requests) == 1


def test_saved_copy_is_used_and_flagged_when_power_fails(tmp_path):
    working, _ = power_client(power_ok(), cache_dir=tmp_path)
    working.season(*OTHER_POINT)

    failing, _ = power_client(power_down, cache_dir=tmp_path)
    climate = failing.season(*OTHER_POINT)

    assert climate.status == "available"
    assert climate.stale is True
    assert climate.drySpellYears == 3


def test_saved_sample_only_applies_to_its_own_point():
    client, _ = power_client(power_down)

    sample = client.season(*SAMPLE_POINT)
    other = client.season(*OTHER_POINT)

    assert sample.kind == "saved-sample"
    assert (sample.start, sample.end) == (date(2024, 5, 1), date(2024, 5, 7))
    assert sample.sampleRainMm == 18.2
    assert sample.drySpellYears is None
    assert other.status == "unavailable"
    assert other.kind == "season-history"
    assert other.reason == "upstream_error"
