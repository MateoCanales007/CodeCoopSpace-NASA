# CodeCoopSpace-NASA

Base de trabajo de [CodeCoop Space](https://www.spaceappschallenge.org/2026/find-a-team/codecoop-space/) para NASA Space Apps 2026, San Salvador.

## Reto elegido · Field Shift: Adapting Farms with NASA Data

Las lluvias irregulares, el calor, la escasez de agua y el deterioro del suelo complican la elección de qué sembrar después de cada cosecha. Una rotación que ayuda a proteger el suelo en una zona puede exigir demasiada agua en otra, quedar fuera de la temporada adecuada o presentar riesgos que requieran revisión local.

El reto propone construir una herramienta de apoyo a decisiones que combine **observaciones terrestres de NASA, información de suelo local, características de los cultivos y prioridades del agricultor**. El objetivo es comparar secuencias de cultivos que puedan mejorar la salud del suelo y la adaptación a condiciones cambiantes, explicando qué evidencia respalda cada opción, qué beneficios podría aportar y qué información falta. [Enunciado oficial](https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/) · [Video del reto](https://www.youtube.com/watch?v=cF0U2WXsM7o).

## Nuestra propuesta

CodeCoop Space propone una aplicación para familias que cultivan granos básicos en El Salvador y técnicos que las asesoran. El piloto propuesto usa una localidad de San Miguel para responder una pregunta concreta: **¿qué vale la pena considerar para el próximo ciclo si mi prioridad es cuidar el agua o el suelo?** La aplicación estará pensada para navegador de escritorio y móvil y abrirá directamente, sin cuentas de usuario.

1. La persona elige una zona, indica su cultivo actual y aporta lo que sabe del suelo, como textura o drenaje. Puede dejar esos datos como desconocidos.
2. Elige qué priorizar: agua, suelo o diversificación. La aplicación resume el clima histórico del lugar e indica periodo, fuente y cobertura.
3. Compara la rotación actual con dos alternativas. Un ejemplo por validar es maíz → maíz frente a maíz → frijol y maíz → sorgo. Cada opción muestra qué la favorece, qué la limita y qué faltaría comprobar antes de llevarla a la práctica.
4. La persona cambia una prioridad y puede ver qué cambia en la comparación y por qué. Las fuentes y los supuestos quedan accesibles desde el resultado.

### Cómo usaremos los datos

- **NASA** aporta el contexto histórico. Ya hay una muestra real de [NASA POWER](https://power.larc.nasa.gov/) para probar la conexión. El equipo evaluará [GPM IMERG](https://gpm.nasa.gov/data) para precipitación histórica. En la demo, un dato NASA debe influir en al menos una métrica o alerta visible de la comparación.
- **Suelo y cultivos** se documentan con datos aportados por la persona, referencias locales como [CENTA](https://www.centa.gob.sv/servicios/programa-granos-basicos/) y supuestos de demo identificados como tales. Los datos de una cuadrícula describen una zona y tienen una escala distinta a la de una medición en la parcela.
- **Meteomatics** aporta clima complementario con fecha y fuente identificadas. La comparación basada en NASA debe seguir disponible si falla ese servicio. [Método y límites](docs/DATOS-Y-METODO.md).

La meta del hackatón es una demo reproducible para una localidad. Un juez debe poder cambiar una prioridad, ver el efecto y rastrear al menos un resultado hasta su fuente. Las comparaciones sirven para explorar y conversar con un técnico local. La base actual trae la pantalla inicial, una API con ruta de salud y la muestra de datos. La comparación de rotaciones y Meteomatics están pendientes en el tablero.

## Evento, evaluación y canjes

- **Evento y equipo.** [San Salvador](https://www.spaceappschallenge.org/2026/local-events/san-salvador/) · [CodeCoop Space](https://www.spaceappschallenge.org/2026/find-a-team/codecoop-space/) · [Fuentes oficiales de Field Shift](https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/?tab=resources).
- **Jurado.** Evalúa impacto, creatividad, validez, relevancia y presentación. Para evaluación global, la ficha va en inglés y se enlaza una demo pública de hasta 7 diapositivas o un video de hasta 30 segundos. Si el video se narra en español, lleva subtítulos en inglés. [Criterios](https://www.spaceappschallenge.org/resources/judging-awards-guide/#judging-criteria) · [Guía de entrega](https://www.spaceappschallenge.org/resources/project-submission-guide/) · [Presentación oficial](https://www.youtube.com/watch?v=CV7AYfMRyMM).
- **Canjes.** [Meteomatics para participantes](https://www.meteomatics.com/en/meteomatics-and-nasa-space-apps-challenge/) · [GitHub Copilot](https://github.com/features/copilot) · [Catálogo oficial](https://www.spaceappschallenge.org/2026/global-offers/) · [Las diez ofertas con enlaces directos y condiciones](docs/EVENTO.md#las-diez-ofertas-publicadas).

## Empieza aquí

1. Abre el [Kanban](https://github.com/users/MateoCanales007/projects/10/views/2), elige una tarea disponible y avisa a Mateo si cambia el alcance o bloquea una entrega.
2. Lee el [alcance del prototipo](docs/RETO.md). Si usas un asistente, comparte el issue y las [instrucciones comunes](AGENTS.md). La [guía de inicio](ai/INICIO.md) cubre Claude Code con Haiku, GitHub Copilot y otros clientes.
3. Usa el [contrato compartido](docs/CONTRATO.md) para coordinar frontend, API, datos y cálculo. Su estado inicial es una propuesta para aprobación del equipo.
4. Consulta [ofertas, fuentes y materiales oficiales](docs/EVENTO.md), [equipo y tiempos](docs/EQUIPO.md), [datos y método](docs/DATOS-Y-METODO.md) y [entrega](docs/ENTREGA.md) según tu tarea.

## Ejecutar en local

Requisitos de la base verificada: Git, Node.js 24 LTS con npm y Python 3.14. Acepta la invitación al repositorio privado antes de clonarlo.

```bash
git clone https://github.com/MateoCanales007/CodeCoopSpace-NASA.git
cd CodeCoopSpace-NASA
```

Abre dos terminales desde la raíz del repositorio.

```powershell
cd apps/frontend
npm ci
npm run web
```

```powershell
cd services/api
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

En macOS/Linux puedes usar `python3 -m venv .venv` y `.venv/bin/python` en lugar de las rutas de Windows.

Expo indica en la terminal la dirección web, normalmente `http://localhost:8081`. La API arranca en `http://127.0.0.1:8000`. Comprueba `/health` y abre `/docs` para ver OpenAPI. La pantalla actual es el punto de partida, y el único endpoint implementado es salud.

`npm run start` abre el menú de Expo para probar en un teléfono compatible o emulador. Cuando el frontend consuma la API desde un teléfono físico, arranca Uvicorn con `--host 0.0.0.0` en una red de confianza y configura `EXPO_PUBLIC_API_URL` en el `.env.local` del frontend con la IP LAN de tu equipo. Toda variable `EXPO_PUBLIC_*` es visible para clientes. Para otro origen web configura `FIELD_SHIFT_WEB_ORIGINS` del servidor con una lista de orígenes exactos.

Verificación frontend: `npm run typecheck` y `npm run build:web`. El export estático termina en `apps/frontend/dist/`.

## Estructura

| Carpeta | Responsabilidad |
| --- | --- |
| `apps/frontend/` | React Native + Expo + TypeScript para navegador, Android e iOS |
| `services/api/` | Python + FastAPI para datos, validación HTTP y comparación |
| `data/samples/` | Muestras acotadas de NASA con procedencia |
| `docs/` | Requisitos, decisiones, método, contratos y entrega |
| `ai/` | Guía de inicio para asistentes y plantilla de traspaso |

El evento local anuncia el cierre el **15 de noviembre de 2026 a las 11:59 p. m.** en El Salvador. Revisen primero si el coordinador local les dio un corte anterior para el pitch. [Evento oficial en San Salvador](https://www.spaceappschallenge.org/2026/local-events/san-salvador/).
