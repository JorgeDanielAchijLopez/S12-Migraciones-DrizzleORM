import 'dotenv/config';
import { app } from './app';
import { pool } from './db/conexion';

const puerto = Number(process.env.PORT || 3000);
if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error('PORT debe ser un número entre 1 y 65535');
}

const server = app.listen(puerto, () => {
  console.log(`API S12 lista en http://localhost:${puerto}`);
  console.log(`Salud: http://localhost:${puerto}/health`);
});

async function cerrar() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
