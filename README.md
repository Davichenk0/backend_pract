# Backend SICOV CI2

API REST de la Mesa de Servicios SICOV CI2: programacion semanal, rotacion de turnos y gestion de novedades.
Node.js + Express + PostgreSQL + Prisma + Zod, con autenticacion JWT.

## Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
#    Copiar .env.example a .env y ajustar DATABASE_URL y JWT_SECRET
copy .env.example .env

# 3. Crear la base de datos (una sola vez)
#    CREATE DATABASE sicov_ci2;

# 4. Aplicar migraciones y generar el cliente Prisma
npm run prisma:migrate
npm run prisma:generate

# 5. Cargar usuarios iniciales
npm run prisma:seed

# 6. Arrancar en desarrollo
npm run dev
```

Servidor por defecto: `http://localhost:3000/api`.

## Variables de entorno

| Variable | Obligatoria | Descripcion |
|---|---|---|
| `PORT` | No | Puerto HTTP. Default `3000` |
| `NODE_ENV` | No | `development` \| `production` \| `test` |
| `DATABASE_URL` | Si | Cadena de conexion PostgreSQL |
| `JWT_SECRET` | Si | Secreto de firma, minimo 32 caracteres |
| `JWT_EXPIRES_IN` | No | Vigencia del token. Default `8h` |
| `CORS_ORIGIN` | No | Origen(es) permitidos, separados por coma |
| `BCRYPT_ROUNDS` | No | Coste del hash. Default `10` |
| `SEED_PASSWORD` | No | Contrasena de los usuarios del seed |

## Endpoints base

| Metodo | Ruta | Auth | Descripcion |
|---|---|---|---|
| `GET` | `/api/health` | No | Estado del servicio |
| `POST` | `/api/auth/login` | No | Login: devuelve `token` y `usuario` |
| `GET` | `/api/auth/me` | Bearer | Usuario autenticado |
| `POST` | `/api/auth/registro` | Bearer + `JEFE` | Crea un usuario |

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "david.cajamarca@sicov.local",
  "password": "SicovCI2*2026"
}
```

Respuesta:

```json
{
  "token": "eyJhbGciOi...",
  "usuario": {
    "id": "uuid",
    "nombre": "David Gonzalo Cajamarca Torres",
    "email": "david.cajamarca@sicov.local",
    "rol": "JEFE",
    "esJefe": true,
    "activo": true,
    "ultimoAcceso": "2026-11-11T00:00:00.000Z"
  }
}
```

Las rutas protegidas esperan `Authorization: Bearer <token>`.

### Usuarios del seed

| Nombre | Email | Rol |
|---|---|---|
| David Gonzalo Cajamarca Torres | `david.cajamarca@sicov.local` | `JEFE` |
| Ingelyn Samantha Gamboa Ruiz | `ingelyn.gamboa@sicov.local` | `ANALISTA` |
| Emanuel Salazar Bernal | `emanuel.salazar@sicov.local` | `ANALISTA` |
| Johan Felipe Londono Lemus | `johan.londono@sicov.local` | `ANALISTA` |
| Evelyn Ruiz Torres | `evelyn.ruiz@sicov.local` | `ANALISTA` |

Contrasena inicial: valor de `SEED_PASSWORD` (por defecto `SicovCI2*2026`).

## Estructura

```
src/
├── config/          env.js (Zod), db.js (PrismaClient unico)
├── routes/          index.js + <dominio>.routes.js
├── controllers/     HTTP <-> servicio, sin logica de negocio
├── services/        reglas de negocio, sin req/res ni Prisma
├── repositories/    unico lugar que importa Prisma
├── middlewares/     validate, authenticate, authorize, notFound, errorHandler
├── schemas/         schemas Zod
├── utils/           ApiError, asyncHandler, jwt, logger
├── app.js           Express sin listen
└── server.js        listen + cierre ordenado
prisma/
├── schema.prisma
├── migrations/
└── seed.js
```

## Agregar un dominio

1. `src/routes/<dominio>.routes.js`
2. `src/controllers/<dominio>.controller.js`
3. `src/services/<dominio>.service.js`
4. `src/repositories/<dominio>.repository.js`
5. `src/schemas/<dominio>.schema.js`
6. Modelo(s) en `prisma/schema.prisma` + `npm run prisma:migrate`
7. Montar en `src/routes/index.js`

## Notas

- No hay pruebas unitarias por decision del proyecto; no se incluye `npm test`.
- La autenticacion usa JWT sin estado (no hay refresh token ni logout en servidor).
- La contrasena nunca se devuelve en las respuestas.
- Los modulos de negocio (programacion, novedades, informes) aun no estan implementados; la base queda lista para agregarlos.
