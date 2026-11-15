"""Valores agrícolas y fuentes que citan las reglas.

Cada valor se leyó en la fuente indicada (título, año, página o cuadro) el
2026-11-15. Lo que es decisión del método y no sale de una fuente vive en
`rules.py` y se declara en la fuente `method-rules`.

Pendiente de validación local: ninguna fuente compara de forma directa la
sensibilidad del frijol y del maíz al encharcamiento, y ninguna afirma que
repetir un cultivo dañe el suelo. Las reglas no usan esas dos ideas.
"""

from typing import Literal

from pydantic import BaseModel

from app.sites import CropId

SourceKind = Literal["nasa", "local-reference", "technical-reference", "user-input", "demo-assumption"]


class CropFacts(BaseModel):
    family: Literal["cereal", "legume"]
    # Ky estacional: FAO-56 (1998), cuadro 24, tomado de FAO-33. También FAO-66 (2012), cuadro 1.
    ky: float
    # CENTA: maíz «muy sensible al aniego o encharcamiento» (p. 8); frijol «no tolera… acumulación
    # de agua» (p. 16). FAO: sorgo «relatively tolerant to short periods of waterlogging».
    waterlogging: Literal["sensitive", "tolerant"]


class SourceDef(BaseModel):
    name: dict[str, str]
    url: str | None
    version: str | None
    kind: SourceKind
    note: dict[str, str]


CROP_FACTS: dict[CropId, CropFacts] = {
    "maize": CropFacts(family="cereal", ky=1.25, waterlogging="sensitive"),
    "bean": CropFacts(family="legume", ky=1.15, waterlogging="sensitive"),
    "sorghum": CropFacts(family="cereal", ky=0.9, waterlogging="tolerant"),
}

SOURCES: dict[str, SourceDef] = {
    "fao-ky": SourceDef(
        name={
            "es": "FAO-56, cuadro 24, y FAO-66, cuadro 1: factor Ky",
            "en": "FAO-56, Table 24, and FAO-66, Table 1: Ky factor",
        },
        url="https://www.fao.org/4/x0490e/x0490e0e.htm",
        version="1998 / 2012",
        kind="technical-reference",
        note={
            "es": "Ky de toda la temporada (de FAO-33): maíz 1.25, frijol 1.15, sorgo 0.9. Según FAO-66, con Ky mayor que 1 el cultivo es muy sensible a la falta de agua y con Ky menor que 1 es más tolerante. Son valores generales, no medidos en El Salvador.",
            "en": "Whole-season Ky (from FAO-33): maize 1.25, beans 1.15, sorghum 0.9. According to FAO-66, with Ky above 1 the crop is very sensitive to water deficit and with Ky below 1 it is more tolerant. These are general values, not measured in El Salvador.",
        },
    ),
    "centa-drainage": SourceDef(
        name={"es": "CENTA: recomendaciones por exceso de humedad", "en": "CENTA: recommendations for excess moisture"},
        url="https://www.centa.gob.sv/recomendaciones-para-mitigar-exceso-de-humedad-en-cultivos/",
        version="2024",
        kind="local-reference",
        note={
            "es": "CENTA recomienda realizar drenajes frente al exceso de agua o la inundación en las secciones de maíz, frijol y sorgo.",
            "en": "CENTA recommends drainage to address excess water or flooding in the maize, bean, and sorghum sections.",
        },
    ),
    "centa-guides": SourceDef(
        name={
            "es": "CENTA: guías técnicas de maíz, frijol y sorgo",
            "en": "CENTA: technical guides for maize, beans and sorghum",
        },
        url="https://www.centa.gob.sv/servicios/programa-granos-basicos/",
        version="2018",
        kind="local-reference",
        note={
            "es": "Maíz: al menos 500 a 700 mm de lluvia bien distribuida y muy sensible al encharcamiento (p. 8). Frijol: consumo promedio de 228 mm (p. 15), no tolera acumulación de agua (p. 16), fija nitrógeno (p. 9) y se rota con cultivos no hospederos contra enfermedades (p. 30). Sorgo: 550 mm (p. 8) y muy tolerante a la sequía (p. 15). Leídas en copias archivadas de los enlaces oficiales de descarga.",
            "en": "Maize: at least 500 to 700 mm of well distributed rain and very sensitive to waterlogging (p. 8). Beans: average use of 228 mm (p. 15), do not tolerate standing water (p. 16), fix nitrogen (p. 9) and are rotated with non-host crops against diseases (p. 30). Sorghum: 550 mm (p. 8) and very drought tolerant (p. 15). Read from archived copies of the official download links.",
        },
    ),
    "fao-crop-info": SourceDef(
        name={
            "es": "FAO Tierras y Aguas: información de cultivos (maíz y sorgo)",
            "en": "FAO Land & Water: crop information (maize and sorghum)",
        },
        url="https://web.archive.org/web/2026/https://www.fao.org/land-water/databases-and-software/crop-information/sorghum/en/",
        version=None,
        kind="technical-reference",
        note={
            "es": "El sorgo es relativamente tolerante a periodos cortos de encharcamiento; el maíz es susceptible. La página original ya no está en línea: se leyó la copia archivada.",
            "en": "Sorghum is relatively tolerant to short periods of waterlogging; maize is susceptible. The original page is no longer online: the archived copy was read.",
        },
    ),
    "fao-soil-water": SourceDef(
        name={"es": "FAO-56, cuadro 19: agua que guarda cada tipo de suelo", "en": "FAO-56, Table 19: water held by each soil type"},
        url="https://www.fao.org/4/x0490e/x0490e0c.htm",
        version="1998",
        kind="technical-reference",
        note={
            "es": "Agua disponible típica: arena 0.05 a 0.11 m³/m³; franco 0.13 a 0.18; arcilla 0.12 a 0.20. Por eso un suelo arenoso sube un nivel la falta de lluvia. Son valores típicos, no una medición de su tierra.",
            "en": "Typical available water: sand 0.05 to 0.11 m³/m³; loam 0.13 to 0.18; clay 0.12 to 0.20. That is why a sandy soil raises the lack of rain one level. These are typical values, not a measurement of your soil.",
        },
    ),
    "drought-definition": SourceDef(
        name={"es": "MARN: sequía meteorológica y día seco", "en": "MARN (El Salvador): meteorological drought and dry day"},
        url="https://www.snet.gob.sv/ver/meteorologia/clima/sequia+meteorologica/",
        version=None,
        kind="local-reference",
        note={
            "es": "Sequía meteorológica débil: 5 a 10 días secos consecutivos en la época lluviosa; moderada: 11 a 15; fuerte: más de 15. Día seco: menos de 1 mm en 24 horas (Resumen climatológico de julio de 2023, p. 5).",
            "en": "Weak meteorological drought: 5 to 10 consecutive dry days in the rainy season; moderate: 11 to 15; strong: more than 15. Dry day: under 1 mm in 24 hours (Climatological summary for July 2023, p. 5).",
        },
    ),
    "rotation-principle": SourceDef(
        name={"es": "FAO: agricultura de conservación, diversificación de especies", "en": "FAO: Conservation Agriculture, species diversification"},
        url="https://www.fao.org/conservation-agriculture/in-practice/species-diversification/en/",
        version=None,
        kind="technical-reference",
        note={
            "es": "La rotación evita que plagas y enfermedades propias de un cultivo pasen al siguiente y aumenta la fijación de nitrógeno. La ficha «Save and Grow» de maíz y leguminosas (FAO, 2015) añade que esa rotación ayuda a mantener la fertilidad.",
            "en": "Rotation prevents crop-specific pests and diseases from carrying over to the next crop and increases nitrogen fixation. The FAO Save and Grow fact sheet on maize and legumes (2015) adds that this rotation helps maintain soil fertility.",
        },
    ),
    "user-answers": SourceDef(
        name={"es": "Sus respuestas en el formulario", "en": "Your answers in the form"},
        url=None,
        version=None,
        kind="user-input",
        note={
            "es": "Textura y drenaje del suelo según lo que usted respondió. No se comprueba en el terreno.",
            "en": "Soil texture and drainage as you answered. It is not checked in the field.",
        },
    ),
    "method-rules": SourceDef(
        name={"es": "Supuestos del método de Yago", "en": "Yago method assumptions"},
        url=None,
        version=None,
        kind="demo-assumption",
        note={
            "es": "Decisiones ilustrativas del equipo, sin validación local: la zona pasa a falta de lluvia media si 2 de cada 10 años tuvieron racha seca y a alta si fue la mitad o más; el suelo arenoso sube un nivel; Ky de 1.2 o más cuenta como muy sensible; repetir cultivo, cambiar dentro de la familia y cambiar de familia valen 0, 1 y 2; manda la prioridad principal y las otras desempatan.",
            "en": "Illustrative team decisions, not validated locally: the area moves to a medium lack of rain if 2 in 10 years had a dry spell and to high if half or more did; sandy soil raises it one level; a Ky of 1.2 or more counts as very sensitive; repeating the crop, changing within the family and changing family score 0, 1 and 2; the top priority decides and the others break ties.",
        },
    ),
}
