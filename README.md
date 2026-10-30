# S12 — Migraciones con Drizzle ORM

API HTTP de **productos de ferretería** desarrollada en TypeScript con Express, PostgreSQL, Drizzle ORM y validaciones con Zod.

**Objetivo:** demostrar CRUD, validaciones, migraciones versionadas (inicial y evolutiva) y persistencia de los datos. El repositorio debe incluir las dos migraciones generadas durante los pasos siguientes.

## Requisitos

- Node.js 20 o superior y npm.
- Docker Desktop iniciado (con Docker Compose).
- PowerShell/CMD en Windows o terminal equivalente.
- Para pruebas manuales: Postman, Thunder Client o la extensión **REST Client** de VS Code (archivo `pruebas.http`).

## 1. Preparar proyecto y base de datos

En CMD (desde la carpeta del proyecto):

```bat
npm install
copy .env.example .env
docker compose up -d
docker compose ps
```

`docker compose ps` debe mostrar `s12-ferreteria-db` con estado **healthy** antes de migrar. El servicio usa puerto host **5435** para evitar conflictos con otros PostgreSQL locales. Las credenciales de `.env.example` son exclusivamente ejemplos de desarrollo: antes de usar otra máquina o publicar, cambia la clave en `.env` y en la URL de conexión. **Jamás subas `.env` a Git.**

## 2. Primera migración: crear tabla productos

El archivo `src/db/schema.ts` contiene inicialmente los campos `id`, `nombre`, `precio`, `stock` y `creado_en`.

```bat
npm run db:generate -- --name=inicial
npm run db:migrate
```

**CAPTURAS:** generación y aplicación exitosa. Se crearán archivos SQL y snapshots dentro de `drizzle/`.

## 3. Segunda migración: evolucionar tabla

El siguiente comando solo copia al schema TypeScript una versión que añade `categoria` y `activo` (no modifica la BD). Luego Drizzle Kit detecta la diferencia y genera otra migración real:

```bat
npm run db:evolve
npm run db:generate -- --name=agregar_categoria_activo
npm run db:migrate
npm run db:check
```

**CAPTURAS:** segunda generación, segunda aplicación, y dos archivos `.sql` en la carpeta `drizzle/`. Estos archivos y su carpeta `meta/` **deben conservarse y subirse a Git**. Nunca uses `drizzle-kit push` en esta tarea, porque no produce un historial de migraciones versionadas equivalente.

## 4. Compilar y ejecutar API

```bat
npm run build
npm run dev
```

Salida esperada cuando todo está correctamente configurado:

```text
API S12 lista en http://localhost:3000
Salud: http://localhost:3000/health
```

La API **solo funciona con el esquema final**. No es necesario arrancar la API entre la primera y segunda migración.

## 5. Endpoints

| Método | Ruta | Resultado |
|---|---|---|
| GET | `/health` | Conexión disponible (200) |
| GET | `/api/productos` | Lista de productos (200) |
| GET | `/api/productos/:id` | Un producto (200) o no encontrado (404) |
| POST | `/api/productos` | Crea un producto (201) |
| PATCH | `/api/productos/:id` | Actualiza un producto (200) |
| DELETE | `/api/productos/:id` | Elimina un producto (204) |

Ejemplo de `POST /api/productos`:

```json
{
  "nombre": "Taladro inalámbrico",
  "precio": 349.50,
  "stock": 8,
  "categoria": "Herramientas",
  "activo": true
}
```

`nombre` es obligatorio (3 a 120 caracteres), `precio` es un número positivo con hasta dos decimales, `stock` es entero y no negativo. `categoria` (3 a 60 caracteres) y `activo` (booleano) son opcionales; PostgreSQL les asigna valores predeterminados. Las respuestas devuelven `precio` como texto decimal, comportamiento propio del tipo `numeric` de PostgreSQL. Un JSON inválido o datos incorrectos devuelven **400**; un ID inexistente, **404**; y un fallo inesperado, **500**.

Para probarlos, abre `pruebas.http` con REST Client o ejecuta en **otra terminal PowerShell**:

```powershell
.\scripts\probar-api.ps1
```

También puedes usar `Invoke-RestMethod` o Postman. Conserva capturas de los códigos HTTP de cada operación.

## 6. Prueba de persistencia: antes y después del reinicio

1. Con API encendida, crea **otro** producto con POST (no lo elimines). Guarda el `id` devuelto.
2. Consulta ese mismo ID con `GET /api/productos/{id}`. **CAPTURA ANTES.**
3. En la consola donde está Node, pulsa `Ctrl+C` para detener **solo la API**. No uses `docker compose down -v`.
4. Ejecuta `npm run dev` otra vez.
5. Consulta **el mismo ID**. **CAPTURA DESPUÉS.** Si aparece, se prueba que la información estaba almacenada en PostgreSQL y no solo en la memoria del proceso Node.

El volumen Docker `s12_pg_data` guarda los datos de PostgreSQL. `docker compose down` sin `-v` conserva ese volumen.

## 7. Publicar en GitHub

Crea un repositorio **vacío** y público en GitHub y reemplaza `TU_USUARIO` con tu usuario real:

```bat
git init -b main
git add .
git commit -m "feat: api de productos y migraciones con drizzle"
git remote add origin https://github.com/TU_USUARIO/s12-api-ferreteria-drizzle.git
git push -u origin main
```

Si el repositorio ya existe, adapta los pasos de `git init` y `git remote`. Confirma que `drizzle/` contiene **dos** migraciones SQL y `meta/`, y que `.env` no aparece en Git. `package-lock.json` se genera con `npm install` y sí debe subirse.

Comprobaciones útiles:

```bat
git status
git ls-files drizzle
git ls-files .env
```

`git ls-files .env` debe mostrar la salida vacía.

## 8. PDF de evidencia

Sigue `docs/GUIA_EVIDENCIAS.md`. Incluye la URL pública del repositorio, la generación y aplicación de ambas migraciones, pruebas de los cinco endpoints, errores de validación, y las capturas **antes y después** del reinicio.

**Descripción de la evolución:** se creó una tabla `productos` con nombre, precio y existencias. La segunda migración añadió `categoria` para clasificar los productos y `activo` para indicar disponibilidad. Ambos tienen valores predeterminados, lo que permite conservar los registros previos sin realizar cambios manuales en PostgreSQL.
