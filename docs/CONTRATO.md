# Contrato compartido

Estado: propuesta para acordar en el primer corte. La base implementa `GET /health → {"status":"ok"}` y `GET /v1/climate/meteomatics` (ver abajo). Acordar la forma final en el issue de contrato antes de fijarla en frontend y API.

## Interfaces propuestas

| Ruta | Propósito |
| --- | --- |
| `GET /v1/sites` | Sitios soportados con identificador, nombre y coordenadas aproximadas. Puede incluir catálogos mínimos permitidos. |
| `POST /v1/compare` | Comparar escenarios para un sitio soportado y devolver evidencia, métricas, límites y estado de disponibilidad. |

Petición propuesta para el ejemplo local:

```json
{
  "siteId": "san-miguel-demo",
  "currentCrop": "maize",
  "soil": { "texture": "unknown", "drainage": "unknown" },
  "priorities": ["water", "soil", "diversification"]
}
```

El orden de prioridades es significativo. La validación rechaza prioridades duplicadas o desconocidas e identificadores no soportados. Los nombres de campos van en camelCase en JSON. El frontend localiza las etiquetas para las personas usuarias.

## Respuesta acordable por ambas áreas

- `climate`: estado `available` / `partial` / `unavailable`, periodo, cobertura, métricas, referencia al producto, escala espacial si está verificada y antigüedad de caché si aplica.
- `scenarios[]`: id estable, secuencia ordenada y criterios. Por criterio, valor y unidad cuando haya soporte, evidencia enlazada, motivo legible y estado evaluable/indeterminado.
- `sources[]`: id, nombre, URL, versión conocida y naturaleza del dato (NASA, referencia local o entrada de usuario).
- `warnings[]` y `methodVersion`: datos faltantes, incertidumbre y versión de reglas para reproducir.
- Sin dato, usa `null` y una causa explícita. Si una fuente falla y hay comparación parcial válida, conserva HTTP 200 con advertencias. Si falta un insumo imprescindible y no hay copia válida, define y prueba una respuesta 503. FastAPI conserva 422 para entradas inválidas.

## Clima complementario: `GET /v1/climate/meteomatics` (implementado)

Parámetros opcionales: `latitude` (13.0–14.6), `longitude` (−90.2 a −87.5), `start` y `end` (`YYYY-MM-DD`, máximo 31 días, `end` en el pasado). Por defecto usa el punto y la semana de la muestra NASA POWER de San Miguel (13.64, −88.45; 2024-05-01 a 2024-05-07). Entradas inválidas → 422.

```json
{
  "source": "meteomatics",
  "status": "available",
  "reason": null,
  "message": null,
  "start": "2024-05-01",
  "end": "2024-05-07",
  "units": { "tMaxC": "degC", "tMinC": "degC", "precipMm": "mm" },
  "coverage": { "validDays": 7, "expectedDays": 7 },
  "days": [{ "date": "2024-05-01", "tMaxC": 33.9, "tMinC": 25.9, "precipMm": 3.3 }],
  "provenance": { "product": "Meteomatics Weather API", "url": "https://api.meteomatics.com/...", "retrievedAt": "2026-11-15T00:00:00Z", "timeStandard": "UTC" },
  "stale": false
}
```

- `status`: `available`, `partial` (faltan valores; cada uno queda en `null`) o `unavailable` con `reason` ∈ `not_configured`, `auth_failed`, `timeout`, `upstream_error`, `invalid_response` y un `message` legible. Un fallo del proveedor responde HTTP 200 con `unavailable` para que la comparación NASA siga disponible.
- Caché en memoria de 6 h por sitio y periodo. Si el proveedor falla y hay una copia previa, se devuelve con `stale: true` y su `retrievedAt` original.
- Días en UTC: el valor del día D agrega 00:00–24:00 UTC. POWER usa tiempo solar local (≈ UTC−6 en San Miguel), así que los días no coinciden exactamente.

Los mocks de UI quedan identificados como desarrollo y deben transitar por el mismo contrato. Cuando el API se integre, documentar ejemplo real y validar al menos éxito, 422 y dato no disponible.
