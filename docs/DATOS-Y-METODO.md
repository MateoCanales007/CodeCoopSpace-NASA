# Datos y método

## Fuentes y comprobación

| Fuente primaria | Qué usar y qué comprobar |
| --- | --- |
| [NASA POWER Daily](https://power.larc.nasa.gov/docs/services/api/temporal/daily/) | Acceso probado para `T2M_MAX`, `T2M_MIN` y `PRECTOTCORR`. El ejemplo devuelve °C y mm/día, tiempo solar local y procedencia MERRA2/POWER. Es contexto climático gridded; conserva resolución y procedencia de cada parámetro. |
| [NASA GPM IMERG](https://gpm.nasa.gov/data/imerg) y [catálogo GES DISC](https://cmr.earthdata.nasa.gov/search/site/collections/directory/GES_DISC/gov.nasa.eosdis) | Prioriza probar `GPM_3IMERGDF` Final, V07, diario, cuadrícula de 0.1°. Confirma acceso, versión efectiva, unidades, cobertura y valores de relleno del archivo. Serie distinta de POWER. Evita descargar una colección completa. |
| [NASA Earthdata SMAP](https://search.earthdata.nasa.gov/search?q=SPL3SMP_E) | Extensión opcional para contexto regional de humedad superficial, sujeto a QA y cobertura. El producto gridded de 9 km carece de precisión para atribuir características de suelo a una parcela. |
| [CENTA: granos básicos](https://www.centa.gob.sv/servicios/programa-granos-basicos/) y [guía de maíz](https://www.centa.gob.sv/download/guia-tecnica-cultivo-de-maiz/) | Punto de partida local para maíz, frijol y sorgo. Antes de usar un valor, verificar variedad, zona, temporada, unidad y página/tabla de la referencia. |
| [Meteomatics Weather API](https://www.meteomatics.com/en/api/request/) | Clima complementario consultado solo desde el servidor (`GET /v1/climate/meteomatics`): `t_max_2m_24h:C`, `t_min_2m_24h:C`, `precip_24h:mm`, modelo `mix` por defecto, días UTC. Es un producto modelado/mezclado distinto de NASA. Etiquetar fecha de consulta y fuente, sin usarlo como insumo imprescindible de la comparación. El acceso promocional puede expirar. |
| Entrada de suelo y prioridades | Captura de la persona usuaria o ficha de demo explícitamente hipotética. Textura, drenaje y prácticas de manejo relevantes pueden quedar desconocidos. |

Muestra de conectividad: [serie NASA POWER de siete días](../data/samples/power-san-miguel-2024-05.json). Es un subconjunto manual de valores de un punto aproximado en San Miguel, para verificar el parseo. Una semana histórica aislada es insuficiente para una referencia estacional.

## Ingesta y calidad

1. Elige un sitio y ventana de referencia con ciencia y dirección. Conserva las fechas y ventanas iguales para los escenarios comparados.
2. Guarda URL/consulta, producto, versión, fecha de acceso en UTC, coordenadas y convención de orden, unidades, escala, estándar temporal, cobertura, flags, transformación y hash en el manifiesto junto al dato reproducible.
3. Conserva el dato bruto cuando se pueda redistribuir. Normaliza sin perder unidades, sustituye códigos de relleno por datos faltantes y calcula cobertura como días válidos/esperados. Diferencia un día sin lluvia de un día sin dato. Verifica cómo pasar de la tasa a un acumulado del intervalo según los metadatos del producto.
4. Prueba temprano una consulta y guarda una copia verificable. Si se usa caché, indica fecha y fuente. Un fallo de red debe mostrar datos disponibles etiquetados o un estado sin datos.

## Diseño del cálculo (propuesta)

- Comparar la misma ubicación y periodo de referencia para una secuencia actual y alternativas. Calcular, por ejemplo, precipitación de una ventana, rachas de días secos y días sobre un umbral térmico **solo si** se han definido umbrales defendibles y el porcentaje válido es suficiente. Documenta el mínimo de cobertura adoptado.
- Definir reglas para agua, salud de suelo y diversificación con versión y referencia. Explica qué insumo activa cada riesgo o ventaja. Un proxy de diversidad de familias o cobertura no equivale a una medición de fertilidad. Si hay una restricción fuerte como drenaje desconocido, exprésala como tal y deja el criterio en indeterminado cuando corresponda.
- Prioridades de usuario ordenan criterios o ponderan solo criterios evaluables. Si se usa un puntaje, exponer escala, fórmula, pesos, tratamiento de faltantes y sensibilidad a cambiar prioridades. Evita falsa precisión y empates arbitrarios.
- Sin validación local, la salida es una exploración reproducible para conversar con un técnico. No mostrar predicciones de rendimiento, garantías ni un plan agronómico prescriptivo.

## Matriz de verificación mínima

| Caso | Esperado |
| --- | --- |
| Relleno o un día faltante | No se cuenta como lluvia cero; cambia la cobertura |
| Mismo lugar, climático disponible vs ausente | La métrica o alerta cambia a indeterminada con una explicación |
| Cambiar prioridad con las mismas fuentes | Puede cambiar orden o interpretación; las observaciones y métricas brutas permanecen |
| Suelo desconocido o escenario fuera de la región validada | Límite visible con el dato que ayudaría |
| Ejemplo rehecho a mano por otra persona | Coinciden unidades, valores agregados y motivos |
