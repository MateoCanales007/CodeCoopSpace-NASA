"""Zonas que la persona puede elegir en el formulario.

Son cabeceras departamentales con coordenadas públicas aproximadas, nunca una
parcela. El punto solo sirve para pedir el clima histórico de la celda de NASA
POWER que lo contiene (unos 50 km de lado), así que zonas vecinas pueden
compartir las mismas cifras.
"""

from typing import Literal

from pydantic import BaseModel

CropId = Literal["maize", "bean", "sorghum"]
CROPS: tuple[CropId, ...] = ("maize", "bean", "sorghum")


class Site(BaseModel):
    id: str
    name: str
    department: str
    approxLat: float
    approxLon: float
    crops: list[CropId] = list(CROPS)
    isDemo: bool = False


def _site(site_id: str, name: str, department: str, latitude: float, longitude: float) -> Site:
    return Site(id=site_id, name=name, department=department, approxLat=latitude, approxLon=longitude)


SITES: list[Site] = [
    # Punto piloto del equipo (docs/DECISIONES.md): el mismo de la muestra guardada de NASA POWER.
    _site("san-miguel", "San Miguel", "San Miguel", 13.64, -88.45),
    _site("ahuachapan", "Ahuachapán", "Ahuachapán", 13.92, -89.85),
    _site("santa-ana", "Santa Ana", "Santa Ana", 13.99, -89.56),
    _site("sonsonate", "Sonsonate", "Sonsonate", 13.72, -89.72),
    _site("chalatenango", "Chalatenango", "Chalatenango", 14.04, -88.94),
    _site("santa-tecla", "Santa Tecla", "La Libertad", 13.68, -89.29),
    _site("san-salvador", "San Salvador", "San Salvador", 13.69, -89.19),
    _site("cojutepeque", "Cojutepeque", "Cuscatlán", 13.72, -88.93),
    _site("zacatecoluca", "Zacatecoluca", "La Paz", 13.51, -88.87),
    _site("sensuntepeque", "Sensuntepeque", "Cabañas", 13.88, -88.63),
    _site("san-vicente", "San Vicente", "San Vicente", 13.64, -88.78),
    _site("usulutan", "Usulután", "Usulután", 13.35, -88.44),
    _site("san-francisco-gotera", "San Francisco Gotera", "Morazán", 13.70, -88.10),
    _site("la-union", "La Unión", "La Unión", 13.34, -87.84),
]

SITES_BY_ID = {site.id: site for site in SITES}
