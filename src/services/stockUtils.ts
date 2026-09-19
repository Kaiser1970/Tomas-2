import { Medicine } from '../types';

/**
 * Hay alerta de resurtido solo si el medicamento tiene un mínimo configurado (> 0).
 * Los medicamentos del catálogo precargado no llevan control de inventario hasta que se le asigna un mínimo.
 */
export const hasLowStock = (m: Pick<Medicine, 'stockActual' | 'stockMinimoAlerta'>): boolean =>
  m.stockMinimoAlerta > 0 && m.stockActual <= m.stockMinimoAlerta;
