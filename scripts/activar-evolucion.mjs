import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationRoot = resolve('drizzle');
const metaJournal = resolve('drizzle/meta/_journal.json');
if (!existsSync(metaJournal)) {
  console.error('ERROR: Primero ejecuta npm run db:generate -- --name=inicial y npm run db:migrate.');
  process.exitCode = 1;
} else {
  // NO modifica PostgreSQL. Solo cambia la definición TypeScript del esquema.
  copyFileSync(resolve('etapas/esquema-evolucionado.ts'), resolve('src/db/schema.ts'));
  console.log('Esquema TypeScript evolucionado: categoria y activo añadidos.');
  console.log('Ahora ejecuta: npm run db:generate -- --name=agregar_categoria_activo');
  console.log('Después ejecuta: npm run db:migrate');
}
