# Field Shift — alcance de la demo

El [enunciado oficial](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/) pide combinar observaciones terrestres de NASA, información de suelo local, características de cultivos y prioridades agrícolas para explorar rotaciones frente a condiciones cambiantes. Es una comparación de decisiones de manejo en el tiempo y su evidencia.

**Usuario inicial:** agricultor de granos básicos o técnico que asesora a una familia productora en El Salvador. Caso inicial propuesto: un sitio representativo de San Miguel con entrada de suelo confirmada por el usuario o marcada como hipotética para la demo.

## Recorrido

1. Selecciona sitio y cultivo actual. Indica textura o drenaje, si dispone de ese dato, y qué le importa más: agua, suelo o diversificación.
2. Recibe un resumen climático histórico con fuente, periodo y cobertura. La integración procurará usar un producto de observación NASA como IMERG para precipitación y POWER para contexto si se valida a tiempo.
3. Compara una rotación base y dos alternativas para el siguiente ciclo. Ejemplo de candidatos por evaluar: maíz → maíz, maíz → frijol, maíz → sorgo. La lista depende de referencias locales; cada alternativa debe mostrar ventajas, restricciones y datos faltantes.
4. Cambia una prioridad y verifica qué se altera y por qué. Accede a las fuentes y vuelve a ajustar si falta un dato relevante.

## Aceptación de la demo

- Una URL web usable en navegador de escritorio y móvil, interfaz en español y evidencia accesible desde el resultado.
- La serie NASA modifica al menos una métrica o alerta significativa. Usar un gráfico aislado no satisface este criterio interno.
- Resultados trazables hasta el clima, entradas de suelo, cultivos y prioridades. Identificar el contenido de demostración donde corresponda.
- Si solo existen evidencias suficientes para menos escenarios, explicarlo en la interfaz. Si faltan datos, mostrar qué dato ayudaría a comparar.

Alcance posterior: mapa interactivo, proyecciones de clima, lenguas adicionales y publicación nativa. La demo se puede evaluar con una zona, pocas secuencias y un enlace web.
