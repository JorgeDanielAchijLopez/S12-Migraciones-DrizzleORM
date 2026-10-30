import express, { type ErrorRequestHandler } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db, pool } from './db/conexion';
import { productos } from './db/schema';
import { actualizarProductoSchema, crearProductoSchema } from './validaciones/productos';
import { type ZodError } from 'zod';

export const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

const formatoErrores = (error: ZodError) => error.issues.map((issue) => ({
  campo: issue.path.join('.') || 'cuerpo',
  mensaje: issue.message,
}));

const leerId = (id: string | string[] | undefined): number | null => {
  if (typeof id !== 'string' || !/^\d+$/.test(id)) return null;
  const numero = Number(id);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
};

app.get('/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', baseDeDatos: 'conectada' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/productos', async (_req, res, next) => {
  try {
    const datos = await db.select().from(productos).orderBy(desc(productos.id));
    res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
});

app.get('/api/productos/:id', async (req, res, next) => {
  const id = leerId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'El ID debe ser un entero positivo' });
    return;
  }
  try {
    const [producto] = await db.select().from(productos).where(eq(productos.id, id));
    if (!producto) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
});

app.post('/api/productos', async (req, res, next) => {
  const resultado = crearProductoSchema.safeParse(req.body);
  if (!resultado.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: formatoErrores(resultado.error) });
    return;
  }
  try {
    const { precio, ...datos } = resultado.data;
    const [creado] = await db.insert(productos).values({
      ...datos,
      precio: precio.toFixed(2),
    }).returning();
    res.location(`/api/productos/${creado.id}`).status(201).json(creado);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/productos/:id', async (req, res, next) => {
  const id = leerId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'El ID debe ser un entero positivo' });
    return;
  }
  const resultado = actualizarProductoSchema.safeParse(req.body);
  if (!resultado.success) {
    res.status(400).json({ error: 'Datos inválidos', detalles: formatoErrores(resultado.error) });
    return;
  }
  try {
    const { precio, ...datos } = resultado.data;
    const [actualizado] = await db.update(productos).set({
      ...datos,
      ...(precio === undefined ? {} : { precio: precio.toFixed(2) }),
    }).where(eq(productos.id, id)).returning();
    if (!actualizado) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.status(200).json(actualizado);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/productos/:id', async (req, res, next) => {
  const id = leerId(req.params.id);
  if (id === null) {
    res.status(400).json({ error: 'El ID debe ser un entero positivo' });
    return;
  }
  try {
    const [eliminado] = await db.delete(productos).where(eq(productos.id, id)).returning({ id: productos.id });
    if (!eliminado) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.use(((_error, _req, res, _next) => {
  // Nunca exponer la cadena de conexión ni detalles internos de PostgreSQL.
  if (_error instanceof SyntaxError && 'body' in _error) {
    res.status(400).json({ error: 'JSON inválido' });
    return;
  }
  console.error('Error en la API:', _error);
  res.status(500).json({ error: 'Error interno del servidor' });
}) satisfies ErrorRequestHandler);
