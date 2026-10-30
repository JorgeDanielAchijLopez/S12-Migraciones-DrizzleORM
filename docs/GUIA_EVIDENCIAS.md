# Guía de capturas para el PDF de la S12

Guarda las capturas reales en `docs/evidencias/`. No uses capturas inventadas.

1. `01-generar-inicial.png`: terminal al ejecutar `npm run db:generate -- --name=inicial`, mostrando el archivo SQL generado.
2. `02-aplicar-inicial.png`: terminal al ejecutar `npm run db:migrate`, con finalización exitosa.
3. `03-generar-evolucion.png`: terminal al ejecutar `npm run db:generate -- --name=agregar_categoria_activo`.
4. `04-aplicar-evolucion.png`: terminal al ejecutar `npm run db:migrate` por segunda vez.
5. `05-archivos-migracion.png`: Explorador de VS Code mostrando los dos `.sql` y `drizzle/meta`.
6. `06-health-y-listar.png`: `/health` y `GET /api/productos` con código 200.
7. `07-crear.png`: `POST /api/productos` con JSON y código 201.
8. `08-consultar.png`: `GET /api/productos/:id` con código 200.
9. `09-actualizar.png`: `PATCH /api/productos/:id` con código 200.
10. `10-eliminar.png`: `DELETE /api/productos/:id` con código 204.
11. `11-validacion.png`: `POST` inválido, código 400 y detalle de validación.
12. `12-antes-reinicio.png`: crear producto para persistencia, conservar el ID y tomar captura de su GET.
13. `13-despues-reinicio.png`: reiniciar SOLO el proceso de Node (Ctrl+C y `npm run dev`), hacer GET del mismo ID.
14. `14-repositorio.png`: GitHub con carpeta `drizzle`, código, `.env.example` y `README.md`.

## Explicación breve de la evolución

La migración inicial creó la tabla `productos` con `id`, `nombre`, `precio`, `stock` y `creado_en`. La segunda migración añadió `categoria` y `activo`, ambos con valores por defecto (`General` y `true`) para que los registros existentes siguieran siendo válidos. Ambas migraciones se generaron con Drizzle Kit y se aplicaron con `drizzle-kit migrate`, sin editar PostgreSQL manualmente.

## Orden recomendado para el PDF

Carátula, objetivo y tecnologías, enlace del repositorio, migración inicial, migración evolutiva, pruebas CRUD y validación, persistencia, explicación de evolución, conclusión.
