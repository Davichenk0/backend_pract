# AGENTS.md — Backend SICOV CI2

## Estado actual del repo

- Scaffolding base creado: `package.json`, `src/`, `prisma/`, `.env.example`, `README.md`. **La autenticación ya está implementada** (login JWT, `me`, registro protegido). Los dominios de negocio (programación, novedades, informes, histórico) **aún no existen**: no afirmes que esos endpoints están disponibles.
- **No hay pruebas unitarias por decisión del proyecto.** No crees `npm test`, Vitest, Jest ni archivos de test. La verificación es manual contra la API.
- Antes de escribir código, lee los tres documentos: son vinculantes. `architecture.md` manda en lo técnico; `context-general.md`, en el negocio; `agent-operation-rules.md`, en el modo de trabajo.
- Si los documentos se contradicen o faltan datos, detente y pregunta. No inventes endpoints, modelos ni reglas.

## Decisiones técnicas confirmadas

- PostgreSQL **relacional** como única persistencia; Prisma es el único ORM y solo `repositories/` lo importa.
- API **REST** bajo `/api`.
- **Autenticación real** con email/contraseña, JWT Bearer y `bcryptjs`. Roles: `JEFE` y `ANALISTA`.
- Datos iniciales por **seed de Prisma** (`prisma/seed.js`): los 5 integrantes de `context-general.md` §6, con `SEED_PASSWORD`.
- Sin refresh token ni logout en servidor por ahora: el token expira según `JWT_EXPIRES_IN`.
- El frontend sigue usando `localStorage`; el contrato HTTP se deriva de sus entidades y casos de uso hasta que se conecte.

## Fuente de verdad funcional: frontend

- App Angular 21 en `C:\Users\david\OneDrive\Documentos\TEST` (código en `src/app`).
- **Aún no consume HTTP**: la persistencia es `localStorage` vía `*-local.repository.ts`. No busques un contrato de endpoints existente; derívalo de `features/*/domain/entities`, `infrastructure/dtos`, mappers y casos de uso.
- No modifiques el frontend salvo que se pida. Al proponer un endpoint, cita el archivo del front que lo consumiría (regla de trazabilidad de `agent-operation-rules.md`).

## Contrato de dominio (nombres exactos en español)

- Semanas ISO: id `2026-W46`, `anio`/`numero` ISO, `inicio` lunes y `fin` domingo. Fechas siempre `YYYY-MM-DD` (fecha local, nunca timestamp ISO).
- `EstadoProgramacion`: `{ version, parametros: { fechaBase, indiceReferencia, analistas, turnos }, semanas: [{ id, anio, numero, inicio, fin, asignaciones: [{ analistaId, turnoId }] }] }`.
- `Analista`: `{ id, nombre, turnoInicial, activo }`. `Turno`: `{ id, nombre, horario, descripcion, tono, operativo }`.
- `Novedad`: `{ id, fechaReporte, semanaId, analistaAfectadoId, turnoOriginalId, tipo, detalle, analistaCoberturaId, turnoReorganizadoId, estado, gestionadoPor, fechaGestion, observaciones }`. `gestionadoPor` y `fechaGestion` son `null` mientras está pendiente.
- Enums: `estado` ∈ `pendiente | aprobada | rechazada`; `tipo` ∈ `ausencia | incapacidad | permiso | cambio-turno | cobertura`.
- Turnos 1–5. Turno 4 = descanso (no operativo); turno 5 = oficina `08:00 - 17:00` (valor concreto del front; `context-general.md` solo dice "horario de oficina").

## Reglas de negocio que el backend debe hacer cumplir

Ya existen en los casos de uso del front; replícalas en `services/`, no solo en el cliente:

- Rotación cíclica 1→2→3→4→5→1, un turno por semana; solo analistas `activo`.
- Se generan 12 semanas (`TOTAL_SEMANAS`) y se conservan 4 históricas (`SEMANAS_HISTORICAS`) antes de la semana actual.
- Toda novedad nace `pendiente`; solo las `pendiente` se pueden aprobar/rechazar.
- Rechazo exige `observaciones` ≥ 5 caracteres; `detalle` ≥ 10; el analista de cobertura debe ser distinto del afectado.
- Una novedad aprobada sustituye el turno efectivo de esa semana; el turno original **nunca** se elimina. Una pendiente no altera la programación vigente.
- El front simula la sesión (`SesionService`, `esJefe`, `puedeEditarParametros`). El backend ya implementa auth real: `rol: 'JEFE'` equivale a `esJefe: true`. `JEFE` edita parámetros y resuelve novedades; `ANALISTA` consulta y registra.

## Arquitectura obligatoria

- Flujo: `route → validate (Zod) → controller → service → repository → Prisma`. Sin saltos de capa; sin lógica de negocio en controllers/routes; sin `req`/`res` en services/repositories.
- **Solo `repositories/` importa Prisma.** `PrismaClient` se instancia únicamente en `config/db.js`.
- Un dominio nuevo = archivos hermanos `<dominio>.routes.js`, `.controller.js`, `.service.js`, `.repository.js`, `.schema.js`, modelo Prisma y montaje en `routes/index.js`. No toques otros dominios.
- Los schemas Zod van en `src/schemas/`: `architecture.md` §4/§6 lo exigen aunque el árbol de §3 los omita.
- `app.js` configura Express sin `listen`; solo `server.js` hace `listen` (permite Supertest si algún día se agregan tests).
- Errores esperados con `ApiError(status, message)` propagados con `next(err)`; `errorHandler` global responde. Validación de entrada solo con `validate(schema, source)`; nunca `if` manual en el controller.
- Rutas privadas: `authenticate` (JWT → `req.usuario`) y, si aplica, `authorize('JEFE')`. Nunca comparar roles con `if` en el controller.
- Toda respuesta de usuario debe mapearse a un objeto público: **nunca** devolver `passwordHash`.
- `config/env.js` valida el entorno con Zod al arranque (falla rápido). `DATABASE_URL` y `JWT_SECRET` (≥ 32 caracteres) son obligatorias y se documentan en `.env.example`.
- Persistencia: PostgreSQL + Prisma (según `architecture.md`). El Excel de `context-general.md` es el origen funcional, no el almacenamiento del backend.
- Datos iniciales: `prisma/seed.js`. Al agregar un modelo nuevo que requiera seed, extiéndelo con `upsert` para que sea idempotente.

## Endpoints base existentes

| Método | Ruta | Auth | Archivo |
|---|---|---|---|
| `GET` | `/api/health` | Pública | `src/routes/health.routes.js` |
| `POST` | `/api/auth/login` | Pública | `src/routes/auth.routes.js` |
| `GET` | `/api/auth/me` | Bearer | `src/routes/auth.routes.js` |
| `POST` | `/api/auth/registro` | Bearer + `JEFE` | `src/routes/auth.routes.js` |

## Comandos

```bash
npm install
npm run dev               # nodemon src/server.js
npm run prisma:migrate    # migración en desarrollo
npm run prisma:deploy     # migraciones en producción
npm run prisma:generate
npm run prisma:seed       # datos iniciales (idempotente)
npm run prisma:studio
npm start                 # node src/server.js
```

No existe `npm test` y no debe crearse. Para verificar un endpoint, usa `fetch`/curl contra el servidor o `app.js` con un `listen` temporal.

## Estilo de respuesta

- Español, directo, sin preámbulos ni resúmenes redundantes; código completo y listo para usar.
- Indica siempre qué archivo del frontend respalda cada endpoint/modelo propuesto.
