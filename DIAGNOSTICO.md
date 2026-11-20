# Diagnóstico inicial del laboratorio

## Ejecución de referencia

Comando: `npm test` (con la plantilla recién copiada, sin correcciones).

Resultado: **4 pruebas pasan y 1 falla** (5 pruebas en total).

La prueba fallida es `tests/precios.test.ts > calcularPrecioFinal > rechaza descuentos superiores al 100 %`:

```typescript
expect(() => calcularPrecioFinal(1000, 150)).toThrow(RangeError);
```

Vitest informa: `expected function to throw an error, but it didn't`.

## Análisis de la falla

- Con `precio = 1000` y `descuento = 150`, la implementación actual devuelve `1000 - (1000 * 150) / 100 = -500`.
- Ese total negativo incumple la regla de negocio: un descuento no puede superar el 100 % del precio.
- La prueba falla porque la función **termina normalmente** y devuelve un número; no lanza el `RangeError` que la expectativa exige. `toThrow(RangeError)` necesita que la función lance un error de ese tipo.
- La envoltura `() => ...` es necesaria para entregarle a Vitest la función que debe ejecutar y observar. Si se escribiera `expect(calcularPrecioFinal(1000, 150))`, la llamada se ejecutaría antes de que `toThrow` pudiera inspeccionarla.

## Otras observaciones de la plantilla

- La guía práctica pide verificar `GET /healthy`, pero la plantilla define la ruta como `/salud` en `src/app.ts`. Se alinean ambas partes usando `/healthy`.
- Vitest detectaba también los tests duplicados dentro de `demo_practica/`. Se agregó `vitest.config.ts` para excluir esa carpeta de la ejecución, dejando los tests de la raíz como fuente de verdad.
- El workflow de CI usa `npm install`; se actualizará a `npm ci` ahora que `package-lock.json` está versionado.
