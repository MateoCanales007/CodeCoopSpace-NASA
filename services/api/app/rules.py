"""Reglas explícitas de la comparación. Sin modelos generativos ni azar.

Cada función recibe datos ya normalizados y devuelve un nivel. Los valores
citados viven en `evidence.py`; lo que aquí es decisión del equipo (umbrales,
pesos, desempates) está marcado como supuesto ilustrativo del método.
"""

from typing import Literal

from app.evidence import CROP_FACTS
from app.power import PowerClimate
from app.sites import CropId

METHOD_VERSION = "yago-reglas-0.2.0"

Level = Literal["favorable", "neutral", "unfavorable"]
Priority = Literal["water", "soil", "diversification"]
Texture = Literal["sandy", "loam", "clay", "unknown"]
Drainage = Literal["good", "poor", "unknown"]
Stress = Literal["low", "moderate", "high"]
DroughtClass = Literal["tolerant", "sensitive", "very_sensitive"]

LEVELS: tuple[Level, ...] = ("unfavorable", "neutral", "favorable")
POINTS: dict[Level, int] = {"unfavorable": 0, "neutral": 1, "favorable": 2}

# --- Supuestos ilustrativos del método (no salen de una fuente) -------------
# Orden de prioridades: manda la primera; la segunda y la tercera solo desempatan.
# Con tres niveles (0, 1, 2), los pesos 9, 3 y 1 equivalen a ese orden estricto:
# ninguna combinación de prioridades menores supera un nivel de una mayor.
PRIORITY_WEIGHTS = (9, 3, 1)
# Un criterio sin dato suma como "regular" para no premiar ni castigar la falta de información.
UNDETERMINED_POINTS = 1
# Proporción de años con racha seca a partir de la cual la zona pasa de nivel.
STRESS_MODERATE_SHARE = 0.2
STRESS_HIGH_SHARE = 0.5
# Ky a partir del cual un cultivo sensible se trata como muy sensible.
VERY_SENSITIVE_KY = 1.2
STRESSES: tuple[Stress, ...] = ("low", "moderate", "high")

# Nivel de agua según sensibilidad del cultivo (filas) y falta de lluvia en la zona (columnas).
WATER_TABLE: dict[DroughtClass, dict[Stress, Level]] = {
    "tolerant": {"low": "favorable", "moderate": "favorable", "high": "favorable"},
    "sensitive": {"low": "favorable", "moderate": "neutral", "high": "unfavorable"},
    "very_sensitive": {"low": "neutral", "moderate": "unfavorable", "high": "unfavorable"},
}


def drought_class(crop: CropId) -> DroughtClass:
    """Ky < 1: el rendimiento cae menos que el agua que falta; Ky > 1: cae más."""
    ky = CROP_FACTS[crop].ky
    if ky < 1:
        return "tolerant"
    return "very_sensitive" if ky >= VERY_SENSITIVE_KY else "sensitive"


def water_stress(climate: PowerClimate, texture: Texture) -> Stress | None:
    """Falta de lluvia de la zona, a partir de las rachas secas de julio y agosto.

    Devuelve None cuando no hay historia suficiente (sin datos o solo la muestra
    de una semana). Un suelo arenoso guarda menos agua y sube un nivel.
    """
    if climate.kind != "season-history" or climate.drySpellYears is None or not climate.years:
        return None
    share = climate.drySpellYears / len(climate.years)
    index = 0 if share < STRESS_MODERATE_SHARE else 1 if share < STRESS_HIGH_SHARE else 2
    if texture == "sandy":
        index = min(index + 1, 2)
    return STRESSES[index]


def water_level(next_crop: CropId, stress: Stress | None) -> Level | None:
    return WATER_TABLE[drought_class(next_crop)][stress] if stress else None


def rotation_points(current: CropId, next_crop: CropId) -> int:
    """0 repetir el cultivo, 1 cambiar dentro de la misma familia, 2 cambiar de familia."""
    if current == next_crop:
        return 0
    return 2 if CROP_FACTS[current].family != CROP_FACTS[next_crop].family else 1


def is_blocked(next_crop: CropId, drainage: Drainage) -> bool:
    """Restricción fuerte: un cultivo sensible al encharcamiento en un terreno que se encharca.

    Las fuentes dicen que el frijol no tolera la acumulación de agua y que el maíz es muy
    sensible al encharcamiento, sin ordenarlos entre sí: los dos se tratan igual.
    """
    return drainage == "poor" and CROP_FACTS[next_crop].waterlogging == "sensitive"


def soil_level(current: CropId, next_crop: CropId, drainage: Drainage) -> Level:
    """Efecto de la rotación, salvo que el terreno se encharque con un cultivo sensible."""
    if is_blocked(next_crop, drainage):
        return "unfavorable"
    return LEVELS[rotation_points(current, next_crop)]


def diversification_level(current: CropId, next_crop: CropId) -> Level:
    return LEVELS[rotation_points(current, next_crop)]


def score(levels: dict[Priority, Level | None], priorities: list[Priority]) -> int:
    """Puntaje que ordena primero por la prioridad principal y luego por las demás."""
    return sum(
        weight * (POINTS[levels[priority]] if levels[priority] else UNDETERMINED_POINTS)
        for weight, priority in zip(PRIORITY_WEIGHTS, priorities)
    )
