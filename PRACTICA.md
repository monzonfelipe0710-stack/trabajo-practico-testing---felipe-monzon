# Trabajo práctico: Calidad y pruebas de software

**Taller de Lenguajes de Programación IV · Unidad 4 · Octubre de 2026**

Implementación del laboratorio introductorio de pruebas automatizadas sobre una API de precios hecha con Express y TypeScript. El material teórico se encuentra en `README.md` y la guía de actividades en `Testing-Guía_Practica.md`.

## Estructura

```text
src/
├── app.ts                  # Rutas HTTP (/healthy y /api/precios/calcular)
├── server.ts               # Arranque del servidor en el puerto 3000
└── services/precios.ts     # Regla de negocio y validaciones
tests/
├── precios.test.ts         # Pruebas unitarias del servicio
└── api.test.ts             # Pruebas de integración HTTP con Supertest
.github/workflows/pruebas.yml
package.json / package-lock.json
tsconfig.json / vitest.config.ts
```

La carpeta original `demo_practica/` se conserva como material de referencia. `vitest.config.ts` la excluye de la ejecución para que no se dupliquen los tests.

## Requisitos y comandos

Node.js 22.18 o posterior (se usó Node v24.19.0) y npm.

```bash
npm ci            # instala dependencias desde el lockfile
npm run dev       # arranca la API en http://localhost:3000
npm test          # ejecuta Vitest una vez
npm run test:watch
npm run typecheck # tsc --noEmit, sin generar JavaScript
```

Verificación manual de la API:

```bash
curl http://localhost:3000/healthy
# {"estado":"ok"}

curl -X POST http://localhost:3000/api/precios/calcular \
  -H 'Content-Type: application/json' \
  -d '{"precio":1000,"descuento":10}'
# {"total":900}
```

## Registro de resultados

| Comprobación | Resultado | Observación |
| --- | --- | --- |
| Respuesta de `GET /healthy` | OK | Devuelve `{"estado":"ok"}`. La plantilla tenía `/salud`; se alineó con la guía. |
| Primera ejecución de `npm test` | 4 pasan / 1 falla | Fallaba `rechaza descuentos superiores al 100 %`: la función devolvía `-500` en lugar de lanzar `RangeError`. |
| Corrección del servicio | OK | Se validan precio finito >= 0 y descuento finito entre 0 y 100; se lanza `RangeError`. Las 5 pruebas originales pasan. |
| Nuevas pruebas unitarias | OK | Se agregaron descuento 100 %, precio negativo, descuento negativo y precio `NaN`. Total: 7 pruebas unitarias. |
| Prueba de integración HTTP 400 | OK | `POST` con descuento 150 responde 400 y un JSON con propiedad `error`. Total: 3 pruebas de integración. |
| Verificación `npm run typecheck` | OK | `tsc --noEmit` sin errores. |
| Ejecución final `npm test` | 10 pasan / 0 fallan | 2 archivos, 10 pruebas. |
| CI (`npm ci` + typecheck + tests) | OK | Simulado localmente con los mismos pasos del workflow. |

## Respuestas a las preguntas de repaso

1. **¿Por qué una API que devuelve HTTP 200 puede contener errores de negocio?** El código 200 solo indica que la solicitud fue procesada por la infraestructura HTTP. Si la validación de reglas de negocio está ausente o es incorrecta, la respuesta puede contener un total inválido (por ejemplo, un descuento del 150 % que genera un total negativo) y seguir siendo un 200.

2. **¿Qué diferencia hay entre una prueba unitaria y una de integración?** La unitaria ejerce una unidad aislada, como `calcularPrecioFinal` llamado directamente desde `tests/precios.test.ts`. La de integración comprueba la colaboración entre varias partes: `tests/api.test.ts` usa Supertest para enviar una petición real a Express, que a su vez invoca al servicio.

3. **¿Por qué `toThrow` recibe una función en lugar del resultado de ejecutarla?** Porque Vitest necesita ejecutar el código dentro de un bloque controlado para detectar si lanza una excepción. Si se pasara `calcularPrecioFinal(1000, 150)`, la llamada se evaluaría antes de que `toThrow` pudiera observarla; por eso se usa `() => calcularPrecioFinal(1000, 150)`.

4. **¿Qué diferencia existe entre `npm test` y `npm run typecheck`?** `npm test` ejecuta comportamientos en runtime mediante Vitest y aserciones. `npm run typecheck` ejecuta `tsc --noEmit`, un análisis estático que detecta errores de tipos sin ejecutar el programa ni las pruebas. Son complementarios.

5. **¿Qué aporta GitHub Actions al trabajo colaborativo?** Automatiza la verificación en cada push o pull request: descarga el código, prepara Node, instala dependencias con `npm ci`, chequea tipos y corre las pruebas. Así se detectan regresiones tempranamente y el equipo cuenta con un resultado repetible y visible antes de integrar cambios.

## Respuestas a las preguntas de cierre de la guía

1. Una prueba manual depende de la observación de una persona en un momento dado; una prueba automatizada queda expresada en código, se ejecuta igual todas las veces y puede correrse tras cada cambio.
2. La causa fue que `calcularPrecioFinal` no validaba el descuento: con 150 % devolvía un total negativo en lugar de lanzar `RangeError`.
3. Los casos inválidos comprueban que el sistema rechaza entradas que violan requisitos; los casos habituales solamente confirman el camino feliz y pueden ocultar ese tipo de defectos.
4. `tests/precios.test.ts` comprueba únicamente la función de cálculo. `tests/api.test.ts` comprueba las rutas HTTP, el parseo del body y la traducción de errores de negocio a respuestas 400.
5. Permite detectar regresiones en el momento en que se introducen, cuando el cambio todavía es pequeño y fácil de localizar.

## Integración continua

`.github/workflows/pruebas.yml` se ejecuta en `push` y `pull_request`: `actions/checkout@v4`, `actions/setup-node@v4` con Node 24, `npm ci`, `npm run typecheck` y `npm test`.
