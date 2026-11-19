# API de Gestión de Peritos Informáticos

Examen Parcial – Programación sobre Redes – IFTS 16

API REST con **Express + Sequelize**. Usa **SQLite** en desarrollo y **PostgreSQL** en producción, cambiando solo variables de entorno. Consola con **Morgan** (peticiones HTTP) y **Chalk** (eventos).

## Requisitos
- Node.js 18+
- (Opcional) Docker, solo para PostgreSQL

## Cómo ejecutarlo (SQLite, desarrollo)

```bash
npm install
cp .env.example .env      # DB_DIALECT=sqlite por defecto
npm run seed              # (opcional) recrea roles y 4 usuarios de prueba
npm start
```

El repo ya incluye `forensics.db` con los 3 roles y 4 usuarios precargados. El servidor queda en `http://localhost:3000`.

## Cómo ejecutarlo con PostgreSQL (producción)

```bash
docker compose up -d      # levanta el contenedor de PostgreSQL
# en .env cambiar:
# DB_DIALECT=postgres
npm run seed
npm start
```

Los modelos y controladores son los mismos; solo cambia `src/config/database.js` según `DB_DIALECT`.

## Endpoints

| Método | Ruta | Descripción | Códigos |
|--------|------|-------------|---------|
| POST | `/api/v1/peritos` | Alta de perito. Body: `{ "username": "...", "role_id": 1 }` | 201, 400, 409 |
| GET | `/api/v1/peritos` | Lista peritos activos. Filtro: `?role=ADMIN` | 200, 400 |
| GET | `/api/v1/peritos/:id` | Detalle (solo activos) con nombre de rol | 200, 404 |
| DELETE | `/api/v1/peritos/:id` | Baja lógica (`active = false`) | 200, 404 |

Roles: `1 = ADMIN`, `2 = FORENSIC_INSPECTOR`, `3 = AUDITOR`.

### Ejemplos

```bash
curl -X POST localhost:3000/api/v1/peritos -H "Content-Type: application/json" \
  -d '{"username":"perito_nuevo","role_id":2}'
curl "localhost:3000/api/v1/peritos?role=AUDITOR"
curl localhost:3000/api/v1/peritos/1
curl -X DELETE localhost:3000/api/v1/peritos/1
```

## Consola (Chalk)
- **cyan**: alta/baja de peritos con sus datos
- **yellow**: error de validación (o conflicto) indicando el campo fallido
- **red**: error crítico 500 con stack

## Estructura
```
src/
  config/database.js        conexión dinámica (sqlite | postgres)
  models/                   Role, User y asociaciones
  controllers/              lógica de negocio
  routes/                   ruteo
  middlewares/errorHandler  manejo central de errores (http-errors)
  utils/logger.js           mensajes con chalk
  seed.js  app.js  server.js
```

## Decisiones de diseño
- **Integridad referencial**: `users.role_id` con FK a `roles.id` (`ON DELETE RESTRICT`). SQLite aplica `PRAGMA foreign_keys = ON` vía Sequelize.
- **Soft delete**: DELETE solo actualiza `active = false`; nunca se borra la fila.
- **Errores**: `http-errors` + `try/catch` en cada controlador y un middleware de errores único.
