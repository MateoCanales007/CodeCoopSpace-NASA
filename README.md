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

La meta del hackatón es una demo reproducible para una localidad. Un juez debe poder cambiar una prioridad, ver el efecto y rastrear al menos un resultado hasta su fuente. Las comparaciones sirven para explorar y conversar con un técnico local. La app ya recorre formulario → comparación → explicación: la API calcula las valoraciones con reglas explícitas, clima histórico de NASA POWER por zona y referencias de FAO, MARN y CENTA, y Groq redacta la explicación a partir de ese resultado. Las reglas siguen sin validación local; sus supuestos están declarados en [el método](docs/DATOS-Y-METODO.md).

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

Copia `services/api/.env.example` como `services/api/.env`. Git ignora ese archivo y la API lo carga al arrancar. Todas las variables son opcionales:

- `GROQ_API_KEY` y `GROQ_MODEL`: redacción de la explicación con Groq. Sin clave, la explicación la escribe el backend con sus reglas.
- `METEOMATICS_USERNAME` y `METEOMATICS_PASSWORD`: clima complementario. Sin credenciales, `GET /v1/climate/meteomatics` responde `status: "unavailable"`.

La comparación no necesita ninguna credencial: NASA POWER es público.

Pruebas de la API: instala `requirements-dev.txt` y ejecuta `python -m pytest` desde `services/api`. Las pruebas simulan NASA POWER, Groq y Meteomatics, y no usan la red ni credenciales.

En macOS/Linux puedes usar `python3 -m venv .venv` y `.venv/bin/python` en lugar de las rutas de Windows.

Expo indica en la terminal la dirección web, normalmente `http://localhost:8081`. La API arranca en `http://127.0.0.1:8000`. Comprueba `/health` y abre `/docs` para ver OpenAPI. Rutas implementadas: salud, zonas (`GET /v1/sites`), comparación (`POST /v1/compare`) y clima complementario de Meteomatics. El frontend no trae datos propios: sin la API en marcha muestra un aviso y un botón para reintentar.

Para probar en un teléfono de la misma Wi-Fi, arranca Uvicorn con `--host 0.0.0.0` en una red de confianza y abre en el teléfono `http://<IP de tu equipo>:8081`. En web, el frontend busca la API en ese mismo host, puerto 8000, así que no hay que configurar la IP. Para una app nativa o una API en otro lugar define `EXPO_PUBLIC_API_URL` en `apps/frontend/.env.local`; toda variable `EXPO_PUBLIC_*` es visible para clientes. En desarrollo la API acepta orígenes de red privada; en un despliegue público define `FIELD_SHIFT_WEB_ORIGIN_REGEX` vacío y lista los orígenes exactos en `FIELD_SHIFT_WEB_ORIGINS`.

Verificación frontend: `npm run typecheck` y `npm run build:web`. El export estático termina en `apps/frontend/dist/`.

## Qué probar (QA)

Guía para quien revise la app antes de la entrega. Anota en el issue lo que no coincida con lo esperado, con captura y los pasos.

### Preparación

1. Arranca la API con `--host 0.0.0.0` y el frontend (ver «Ejecutar en local»).
2. Abre la app en el navegador de la computadora y en un teléfono de la misma Wi-Fi (`http://<IP de tu equipo>:<puerto>`).
3. Confirma que `http://<IP>:8000/health` responde `{"status":"ok"}`.

### 1. Entrada y formulario

- La app abre directo en la bienvenida, sin cuentas ni contraseñas.
- El interruptor EN / ES cambia todo el texto, y el idioma se conserva al recargar.
- El paso 1 lista 14 zonas (una cabecera por departamento) y se puede elegir cualquiera.
- En el paso 3, «No sé» viene marcado en textura y en drenaje.
- No se puede avanzar sin elegir una opción en cada paso; la flecha regresa al paso anterior.

### 2. Caso base: San Miguel + maicillo + diversificar

| Drenaje | Qué debe destacar | Qué debe decir |
| --- | --- | --- |
| Se va rápido | Maicillo → Frijol | Cambia de cereal a leguminosa |
| Se encharca | Seguir con maicillo, como «la opción menos desfavorable» | Maíz y frijol quedan «en contra» en suelo, con la cita de CENTA; el resumen dice que pesó que el terreno se encharca |
| No sé | Maicillo → Frijol | «Falta confirmar: … si su terreno se encharca» en las tarjetas, en las notas del final y en «Antes de sembrar» |

Usa «Cambiar» para editar la respuesta y volver a los resultados sin empezar de cero.

### 3. Prioridad, textura y otra zona

- En los resultados, cambia la prioridad entre Agua, Suelo y Variar. Con Agua y maicillo actual debe destacar seguir con maicillo. Debe aparecer el aviso que explica qué cambió, y las cifras de clima no deben cambiar.
- Con tierra «Arenosa» la falta de lluvia sube un nivel: revisa que cambie la valoración de agua del maíz o del frijol y que la alerta de agua lo mencione.
- Repite con Chalatenango + maíz + arenosa + Agua: debe destacar Maíz → Maicillo y la tarjeta de clima debe mostrar 5 de 10 años con racha seca.
- San Miguel, San Vicente y Usulután muestran las mismas cifras de clima: es esperado, porque comparten una celda de NASA POWER de unos 50 km.

### 4. Fuentes y honestidad de los datos

- La tarjeta de clima muestra producto y versión de NASA POWER, periodo (mayo a octubre, 2016–2025), años con datos, escala de la celda y un enlace que abre la consulta a NASA.
- En cada rotación, «Ver por qué y de dónde sale» lista un motivo por criterio y sus fuentes, con etiqueta de tipo: Dato NASA, Referencia local, Referencia técnica, Su respuesta o Supuesto del método.
- La tarjeta de Meteomatics dice que es contexto, que no cambia la comparación, y muestra su periodo y fecha de consulta.
- Al final aparece la nota de que los umbrales de falta de lluvia son supuestos del método.

### 5. Explicación «En resumen»

- Con `GROQ_API_KEY` configurada: la etiqueta dice «Redactado con IA» y el pie nombra el modelo. El texto debe estar en el idioma elegido, hablar de la misma rotación destacada y no traer cultivos ni cifras que no estén en las tarjetas.
- Sin clave (deja `GROQ_API_KEY=` vacío y reinicia la API): la etiqueta dice «Resumen automático» y el pie explica que la IA no está configurada. La comparación debe ser la misma.
- Con una clave inválida: «Resumen automático» con «El servicio de IA falló». La clave no debe aparecer en la pantalla ni en la terminal de la API.

### 6. Fallos que la pantalla debe explicar

| Cómo provocarlo | Qué debe pasar |
| --- | --- |
| Detén la API y abre la app | El paso 1 avisa que no pudo cargar las zonas y ofrece «Intentar otra vez» |
| Detén la API estando en resultados y cambia la prioridad | Los resultados anteriores siguen en pantalla; al volver a arrancar la API, se actualizan |
| Borra `services/api/.cache`, desconecta internet y compara una zona | El clima muestra «Sin dato» con la causa, el agua queda en «Falta dato» y suelo y diversificación siguen valorados |
| Con internet desconectado y la carpeta `.cache` intacta | El clima se muestra con la nota de que viene de una copia guardada |
| Deja vacías las credenciales de Meteomatics | Su tarjeta explica que no está configurado y no muestra cifras; la comparación no cambia |

### 7. Teléfono y accesibilidad

- A 360 px de ancho no hay desplazamiento horizontal ni texto cortado, en inglés y en español.
- El selector de prioridad queda fijo abajo y se alcanza con el pulgar.
- Cada nivel se distingue por forma y palabra (▲ Ayuda, ● Regular, ▼ En contra, ? Falta dato), no solo por color.
- Con «reducir movimiento» activado en el sistema, la bienvenida no tiene transición de arena ni cambio automático de escena.

### 8. Comprobaciones automáticas

```powershell
cd services/api
.\.venv\Scripts\python.exe -m pytest          # pruebas del backend, sin red ni credenciales

cd ../../apps/frontend
npm run typecheck
npm run build:web
npm run check:api                             # con la API en marcha
```

### Pendiente de verificar

- Explicación con Groq real: solo se probó con respuestas simuladas.
- Teléfono físico y app nativa (Android / iOS).
- Citas de CENTA contra el PDF original: se leyeron en copias archivadas.
- Validación local de las reglas por ciencia y datos.

## Estructura

| Carpeta | Responsabilidad |
| --- | --- |
| `apps/frontend/` | React Native + Expo + TypeScript para navegador, Android e iOS |
| `services/api/` | Python + FastAPI para datos, validación HTTP y comparación |
| `data/samples/` | Muestras acotadas de NASA con procedencia |
| `docs/` | Requisitos, decisiones, método, contratos y entrega |
| `ai/` | Guía de inicio para asistentes y plantilla de traspaso |

El evento local anuncia el cierre el **15 de noviembre de 2026 a las 11:59 p. m.** en El Salvador. Revisen primero si el coordinador local les dio un corte anterior para el pitch. [Evento oficial en San Salvador](https://www.spaceappschallenge.org/2026/local-events/san-salvador/).
