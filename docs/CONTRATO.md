# Contrato compartido

Estado: propuesta para acordar en el primer corte. La base solo implementa `GET /health → {"status":"ok"}`. Acordar la forma final en el issue de contrato antes de fijarla en frontend y API.

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

Los mocks de UI quedan identificados como desarrollo y deben transitar por el mismo contrato. Cuando el API se integre, documentar ejemplo real y validar al menos éxito, 422 y dato no disponible.
