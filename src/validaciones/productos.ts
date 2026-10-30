import { z } from 'zod';

const precio = z.number({ error: 'El precio debe ser un número' })
  .finite('El precio debe ser finito')
  .positive('El precio debe ser mayor que cero')
  .max(99999999.99, 'El precio es demasiado alto')
  .refine((valor) => Number(valor.toFixed(2)) === valor, 'El precio admite máximo dos decimales');

export const crearProductoSchema = z.object({
  nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(120),
  precio,
  stock: z.number().int('El stock debe ser entero').min(0, 'El stock no puede ser negativo').max(1000000),
  categoria: z.string().trim().min(3).max(60).optional(),
  activo: z.boolean().optional(),
}).strict();

export const actualizarProductoSchema = crearProductoSchema.partial().refine(
  (datos) => Object.keys(datos).length > 0,
  'Debes enviar al menos un campo para actualizar',
);
