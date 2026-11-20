/** Calcula el precio luego de aplicar un porcentaje de descuento. */
export function calcularPrecioFinal(precio: number, descuento: number): number {
  if (typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0) {
    throw new RangeError('El precio debe ser un número finito mayor o igual que cero');
  }

  if (typeof descuento !== 'number' || !Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
    throw new RangeError('El descuento debe estar entre 0 y 100');
  }

  return precio - (precio * descuento) / 100;
}
