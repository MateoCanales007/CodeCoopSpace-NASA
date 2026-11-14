# Equipo y plan

Mateo coordina integración, decisiones de alcance y entrega. El equipo asigna nombres en GitHub al arrancar. Los seis roles son responsabilidades, no una asignación de cuentas.

| Rol | Área de trabajo | Primer resultado que desbloquea al resto |
| --- | --- | --- |
| Mateo — dirección | Reto, contrato, integración, presentación | Caso piloto y aceptación consensuados |
| Datos NASA | Fuentes, muestras y lectura climática | Serie versionada, cobertura y unidades |
| Ciencia agrícola | Fuentes CENTA, suelo, candidatos y criterios | Matriz de evidencias y ejemplo verificable |
| Backend | `services/api`, validación y cálculo | Resultado con contrato acordado |
| Frontend | `apps/frontend`, formulario y comparación | Recorrido navegable reutilizando componentes universales |
| QA y relato | Casos, accesibilidad, evidencia y demo | Escenario ejecutable y revisión de la entrega |

Con cinco personas, Mateo absorbe el relato y una persona de frontend o datos ejecuta la verificación cruzada. Si hay dos personas en frontend, separen formulario y resultados por archivo y acuerden sus props antes de editar.

## Durante el evento — hora de El Salvador

| Corte interno sugerido | Entregable |
| --- | --- |
| Sábado 14, primer bloque | Acordar caso, contrato, tareas, corte local y fuente NASA accesible |
| Sábado 14, antes de cerrar | Formulario y comparación con datos de desarrollo, muestra NASA validada y reglas revisables |
| Domingo 15, mediodía | Un recorrido integrado, incluso con copia local de datos si hace falta |
| Domingo 15, 4:00 p. m. | Congelar alcance, probar navegador/móvil y cerrar fuentes |
| Domingo 15, 7:00 p. m. | Objetivo de entregar, con margen para enlaces, permisos y plataforma |

Adelanta estos cortes si la sede convoca el pitch antes. El cierre oficial anunciado es 11:59 p. m. del 15. [San Salvador](https://www.spaceappschallenge.org/2026/local-events/san-salvador/).

## Kanban y PR

Todo → In Progress → Done. El responsable mueve su tarjeta al empezar y cuando su resultado se verifica. Si está en revisión o bloqueada, deja estado en un comentario con la siguiente acción y etiquetado solo si el tablero dispone de ella. Para iniciar, elige una tarjeta con dependencias satisfechas, toma una rama `feat/numero-descripcion` y deja evidencia en el PR. Coordinen cambios de contrato en un solo issue. Una rama activa por integrante evita solapamientos.
