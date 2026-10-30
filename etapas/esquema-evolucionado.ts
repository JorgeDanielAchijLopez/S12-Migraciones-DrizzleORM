// ETAPA 2: evolución del esquema. Dos columnas nuevas con valores por defecto
// para conservar los registros existentes al aplicar la segunda migración.
import { boolean, integer, numeric, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const productos = pgTable('productos', {
  id: serial('id').primaryKey(),
  nombre: varchar('nombre', { length: 120 }).notNull(),
  precio: numeric('precio', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  // Estos dos campos son el cambio del segundo historial de migración.
  categoria: varchar('categoria', { length: 60 }).notNull().default('General'),
  activo: boolean('activo').notNull().default(true),
});
