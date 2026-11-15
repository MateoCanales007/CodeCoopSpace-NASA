# Decisiones de CodeCoop Space

| Fecha | Estado | Decisión y motivo |
| --- | --- | --- |
| 2026-11-14 | Adoptada | Monorepo con frontend y API en carpetas separadas. Cada área puede trabajar en su propia rama y revisar el contrato en el mismo historial. |
| 2026-11-14 | Adoptada | React Native + Expo + TypeScript para compartir UI entre web y móvil. FastAPI para ingesta y cálculo. Primera entrega evaluable por navegador. |
| 2026-11-14 | Propuesta | Caso piloto en San Miguel, con rotaciones de granos básicos. Mateo valida el sitio y los candidatos con ciencia y datos. |
| 2026-11-14 | Propuesta | NASA POWER para arrancar; evaluar un recorte histórico GPM IMERG y preferirlo como fuente de precipitación observacional si está disponible. |
| 2026-11-14 | Propuesta | Comparación explicable por criterios, sin depender de un modelo generativo para los cálculos. |
| 2026-11-14 | Propuesta | Meteomatics se consulta solo desde FastAPI (`GET /v1/climate/meteomatics`), con credenciales en `services/api/.env`, caché de 6 h y estado `unavailable` en HTTP 200 ante cualquier fallo. Motivo: la comparación NASA no debe depender de un proveedor con acceso promocional. Alternativa descartada: llamar desde el frontend (expondría credenciales). Issue #14. |

Para cada cambio agrega fecha, decisión, responsable, alternativas consideradas e impacto en issues/contrato. Si la propuesta queda pendiente, indica qué dato falta para resolverla.
