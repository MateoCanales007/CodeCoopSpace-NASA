# Instrucciones para agentes de CodeCoop Space

## Arranque de cada tarea

1. Lee el issue, `git status --short --branch` y [docs/RETO.md](docs/RETO.md).
2. Abre únicamente las partes del [contrato](docs/CONTRATO.md) o del [método](docs/DATOS-Y-METODO.md) que afecte la tarea. Consulta [docs/DECISIONES.md](docs/DECISIONES.md) si hay una discrepancia.
3. Confirma que tu rama corresponde al issue. Respeta archivos con trabajo ajeno y revisa los cambios antes de editar.
4. Implementa la porción más pequeña que cumpla la aceptación del issue. Usa los comandos del [README](README.md) y registra resultados observados.

## Reglas de producto y datos

- Prototipo de exploración de rotaciones para un caso salvadoreño. Presenta rutas comparables, evidencia, incertidumbre y factores que el agricultor puede cambiar.
- Distingue clima histórico de escenarios, y datos NASA de observaciones locales y supuestos. Cita producto, versión disponible, periodo, unidades y escala; una celda climática no mide una parcela. Reconoce cuando faltan datos.
- Verifica valores agrícolas en fuentes primarias y registra página/tabla, contexto y unidades. Las muestras y reglas ilustrativas deben identificarse como tales. Separa cálculos reproducibles del texto interpretativo.
- Mantén los secretos en variables privadas del servidor. Nunca pongas credenciales o datos de fincas privadas en el repositorio o en prompts. Para demos usa parcelas ficticias y ubicaciones públicas aproximadas.

## Colaboración

- Abre un PR contra `main` con `Closes #N` y una prueba reproducible. Si cambia una interfaz compartida, coordina la revisión en el issue.
- Frontend usa componentes React Native compatibles con web y móvil. Backend valida entradas y calcula resultados. Si cambias un contrato, actualiza su documento y coordina con el agente consumidor en el mismo PR o issue.
- Conserva el historial ajeno. Evita reformateos masivos y cambios paralelos sobre el mismo archivo. Las decisiones nuevas se registran en docs/DECISIONES.md. Lleva secretos y accesos por canales privados.
- Documenta el uso de IA que deba declarar el equipo en [docs/ENTREGA.md](docs/ENTREGA.md). Un PR con cálculos científicos necesita un ejemplo comprobable y los supuestos explícitos.

Al cerrar cada tarea, deja el [traspaso](ai/TRASPASO.md) como comentario en el issue o descripción del PR. Indica lo que sigue pendiente y distingue comandos verificados de pruebas propuestas.
