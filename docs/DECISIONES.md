# Decisiones de CodeCoop Space

| Fecha | Estado | Decisión y motivo |
| --- | --- | --- |
| 2026-11-14 | Adoptada | Monorepo con frontend y API en carpetas separadas. Cada área puede trabajar en su propia rama y revisar el contrato en el mismo historial. |
| 2026-11-14 | Adoptada | React Native + Expo + TypeScript para compartir UI entre web y móvil. FastAPI para ingesta y cálculo. Primera entrega evaluable por navegador. |
| 2026-11-14 | Propuesta | Caso piloto en San Miguel, con rotaciones de granos básicos. Mateo valida el sitio y los candidatos con ciencia y datos. |
| 2026-11-14 | Propuesta | NASA POWER para arrancar; evaluar un recorte histórico GPM IMERG y preferirlo como fuente de precipitación observacional si está disponible. |
| 2026-11-14 | Propuesta | Comparación explicable por criterios, sin depender de un modelo generativo para los cálculos. |
| 2026-11-14 | Propuesta | Meteomatics se consulta solo desde FastAPI (`GET /v1/climate/meteomatics`), con credenciales en `services/api/.env`, caché de 6 h y estado `unavailable` en HTTP 200 ante cualquier fallo. Motivo: la comparación NASA no debe depender de un proveedor con acceso promocional. Alternativa descartada: llamar desde el frontend (expondría credenciales). Issue #14. |
| 2026-11-15 | Propuesta | La comparación se calcula en FastAPI (`POST /v1/compare`) con NASA POWER en vivo: 10 épocas lluviosas completas por zona, copia en disco y la muestra de una semana solo como último recurso para su punto. Motivo: el frontend no debe traer datos quemados y cada zona necesita su propio contexto. Alternativa descartada: una muestra fija por zona. Issue #18. |
| 2026-11-15 | Propuesta | Reglas con fuente (FAO-56/66, MARN, guías CENTA 2018) y supuestos ilustrativos declarados (cortes de 20 % y 50 % de años con racha seca, Ky 1.2, escala 0–1–2, orden estricto de prioridades). Falta validación local por ciencia y datos. Ver `docs/DATOS-Y-METODO.md`. Issue #13. |
| 2026-11-15 | Propuesta | Un terreno que se encharca impide destacar maíz o frijol. Motivo: CENTA describe a ambos como no tolerantes o muy sensibles; ninguna fuente los ordena entre sí, así que se tratan igual. |
| 2026-11-15 | Propuesta | Groq redacta la explicación solo desde el servidor y con salida validada; ante cualquier fallo responde el backend. Motivo: la comparación no puede depender de un modelo generativo ni exponer la clave. Alternativa descartada: llamar a Groq desde el frontend. |
| 2026-11-15 | Propuesta | En desarrollo la API acepta orígenes de red privada (`FIELD_SHIFT_WEB_ORIGIN_REGEX`) y el frontend web usa el mismo host en el puerto 8000 si no hay `EXPO_PUBLIC_API_URL`. Motivo: probar desde un teléfono sin reconfigurar con cada cambio de Wi-Fi. En un despliegue público hay que fijar orígenes exactos. |

Para cada cambio agrega fecha, decisión, responsable, alternativas consideradas e impacto en issues/contrato. Si la propuesta queda pendiente, indica qué dato falta para resolverla.
