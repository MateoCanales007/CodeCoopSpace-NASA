# CodeCoopSpace-NASA

Base de trabajo de **CodeCoop Space** para [Field Shift: Adapting Farms with NASA Data](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/), NASA Space Apps 2026, San Salvador.

Queremos que una persona que cultiva granos básicos pueda comparar su rotación actual con alternativas, ver cómo cambian los resultados según su suelo y prioridades, y entender qué viene de datos NASA y qué depende de supuestos.

## Empieza aquí

1. Abre el [Kanban](https://github.com/users/MateoCanales007/projects/10/views/2), elige una tarea disponible y avisa a Mateo si cambia el alcance o bloquea una entrega.
2. Lee el [alcance del prototipo](docs/RETO.md). Si usas un asistente, comparte el issue y las [instrucciones comunes](AGENTS.md). La [guía de inicio](ai/INICIO.md) cubre Claude Code con Haiku, GitHub Copilot y otros clientes.
3. Usa el [contrato compartido](docs/CONTRATO.md) para coordinar frontend, API, datos y cálculo. Su estado inicial es una propuesta para aprobación del equipo.
4. Revisa [equipo y tiempos](docs/EQUIPO.md), [datos y método](docs/DATOS-Y-METODO.md) y [entrega](docs/ENTREGA.md) según tu tarea.

## Ejecutar en local

Requisitos de la base verificada: Node.js 24 LTS con npm y Python 3.14. Ejecuta en dos terminales desde la raíz del repositorio.

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
