# Contexto de IA por rol

Copia al inicio de cualquier asistente que no cargue instrucciones por sí mismo:

> Trabaja en CodeCoopSpace-NASA, issue #___, rol ___. Lee AGENTS.md, el issue y la sección correspondiente de ai/ROLES.md. Resume entradas, salida y aceptación en tres líneas. Inspecciona solo archivos relacionados. Conserva el trabajo ajeno. Deja pruebas, límites y siguiente paso según ai/TRASPASO.md.

| Rol | Lee primero | Entrega al siguiente rol |
| --- | --- | --- |
| Dirección e integración | [Reto](../docs/RETO.md), [equipo](../docs/EQUIPO.md), [entrega](../docs/ENTREGA.md) | Dueños, decisiones, rama integrada y corte local confirmado |
| Datos NASA | [Datos y método](../docs/DATOS-Y-METODO.md) y [contrato](../docs/CONTRATO.md) | Fixture verificable, transformaciones y errores de disponibilidad |
| Ciencia y reglas | [Datos y método](../docs/DATOS-Y-METODO.md) | Evidencia local por parámetro, ejemplo a mano, límites de cada regla |
| Backend | [Contrato](../docs/CONTRATO.md) y método | Payload verificable, errores, pruebas de datos faltantes |
| Frontend | [Reto](../docs/RETO.md) y contrato | Comparación accesible, carga/error/sin datos, integración con API |
| QA y relato | [Entrega](../docs/ENTREGA.md), reto y contrato | Guion, reproducción limpia, fuentes y pruebas de aceptación |

Antes de formular una recomendación agrícola, identifica qué fuentes respaldan el cultivo y qué suposiciones cambian el resultado. Cuando encuentres una contradicción o falta de evidencia, anótala en el issue y explica el efecto observable.
