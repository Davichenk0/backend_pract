# 📘 Guía de Arquitectura Backend — Node.js + Express + Prisma

> **Documento de referencia para agentes IA y desarrolladores.**
> Este archivo define las decisiones técnicas, convenciones y estructura obligatoria del backend. Cualquier código generado debe respetar estas reglas.

---

## 1. Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Runtime | **Node.js** (LTS) | Usar ES Modules (`import`/`export`) |
| Framework HTTP | **Express** | Versión 4.x |
| ORM | **Prisma** | Único acceso permitido a la base de datos |
| Validación | **Zod** | Validación de entrada en middlewares |
| Autenticación | **JWT** (`jsonwebtoken`) + `bcryptjs` | Login con email/contraseña; roles `JEFE` y `ANALISTA` |
| Base de datos | PostgreSQL relacional (Neon/Supabase en demo) | Configurada vía `DATABASE_URL` |
| Semillas | **Prisma seed** (`prisma/seed.js`) | Datos iniciales de usuarios |
| Pruebas | **Sin pruebas por ahora** | No se incluye runner ni script `npm test` |
| Lenguaje | **JavaScript** (ES2022+) | (Ver §9 si se migra a TypeScript) |

**Regla de oro:** ningún archivo fuera de `repositories/` puede importar Prisma directamente.

### 1.1 Decisiones confirmadas del proyecto

- **Persistencia relacional:** PostgreSQL es la única fuente de datos del backend. El Excel de `context-general.md` es origen funcional, no almacenamiento.
- **API REST:** todos los dominios se exponen bajo `/api` con JSON.
- **Autenticación real:** login con email/contraseña, JWT Bearer y roles `JEFE` / `ANALISTA`. El front simulaba la sesión (`SesionService`); el backend pasa a ser la fuente de identidad.
- **Autorización:** `JEFE` gestiona parámetros y aprueba/rechaza novedades; `ANALISTA` consulta y registra novedades.
- **Sin pruebas unitarias por ahora:** no se crea `npm test`, ni Vitest/Jest. La verificación es manual contra la API.
- **Datos iniciales:** se cargan por seed de Prisma (usuarios del equipo, contraseña desde `SEED_PASSWORD`).
- Los módulos de negocio se agregan de a uno siguiendo §6; la base solo incluye autenticación.

---

## 2. Principios de diseño

El proyecto sigue **SOLID** de forma pragmática:

- **S** — Single Responsibility: cada archivo tiene una sola razón para cambiar (controller = HTTP, service = negocio, repository = datos).
- **O** — Open/Closed: agregar un dominio nuevo (ej. `orders/`) no modifica los existentes; se crean archivos hermanos.
- **L** — Liskov: cualquier repositorio debe poder sustituirse por otro que cumpla el mismo contrato.
- **I** — Interface Segregation: los servicios solo dependen de los métodos del repositorio que realmente usan.
- **D** — Dependency Inversion: servicios y controllers reciben sus dependencias por **inyección**, nunca las instancian.

**Buenas prácticas obligatorias:**

- ✅ Separar `app.js` (configuración) de `server.js` (arranque) para permitir tests sin abrir puertos.
- ✅ Manejo centralizado de errores en un único middleware.
- ✅ Validar variables de entorno al arranque (fallar rápido).
- ✅ Validar toda entrada HTTP con Zod antes de llegar al controller.
- ✅ Código asíncrono con `async/await`; errores propagados con `next(err)`.
- ❌ No lógica de negocio en controllers ni rutas.
- ❌ No `try/catch` repetidos en cada método; usar el `errorHandler` global.
- ❌ No acceso a `req`/`res` dentro de services o repositories.
- ❌ No `console.log` en producción; usar logger estructurado (ver §8).

---

## 3. Estructura de carpetas (obligatoria)

```
mi-demo/
├── src/
│   ├── config/
│   │   ├── env.js              # Variables de entorno validadas con Zod
│   │   └── db.js               # Instancia única de PrismaClient
│   ├── routes/
│   │   ├── index.js            # Router principal que monta todos los dominios
│   │   ├── auth.routes.js      # Login, perfil y registro
│   │   └── health.routes.js    # Estado del servicio
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── health.controller.js
│   ├── services/
│   │   └── auth.service.js
│   ├── repositories/
│   │   └── usuarios.repository.js
│   ├── schemas/
│   │   └── auth.schema.js      # Schemas Zod
│   ├── middlewares/
│   │   ├── authenticate.js     # Verifica JWT y carga req.usuario
│   │   ├── authorize.js        # Restringe por rol
│   │   ├── errorHandler.js     # Manejo centralizado de errores
│   │   ├── notFound.js         # 404 para rutas inexistentes
│   │   └── validate.js         # Validación con Zod (body/params/query)
│   ├── utils/
│   │   ├── ApiError.js         # Clase de error personalizada
│   │   ├── asyncHandler.js     # Propaga rechazos a next(err)
│   │   ├── jwt.js              # Firma y verificación de tokens
│   │   └── logger.js           # Log estructurado
│   ├── app.js                  # Configura Express (sin listen)
│   └── server.js               # Punto de entrada (listen)
├── prisma/
│   ├── schema.prisma           # Modelos de datos
│   ├── migrations/             # Migraciones versionadas
│   └── seed.js                 # Datos iniciales
├── .env                        # Variables de entorno (NO versionar)
├── .env.example                # Plantilla de variables (SÍ versionar)
├── package.json
└── README.md
```

**Convención de nombres:**

- Archivos: `kebab-case` con sufijo de capa → `users.controller.js`, `users.service.js`.
- Carpetas: `kebab-case` en plural → `controllers/`, `services/`.
- Al agregar un dominio nuevo (ej. `orders`), crear archivos hermanos: `orders.routes.js`, `orders.controller.js`, `orders.service.js`, `orders.repository.js`.

---

## 4. Responsabilidades por capa

### `config/env.js`
Valida y exporta las variables de entorno. Falla al arrancar si falta algo.

```js
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
});

const resultado = schema.safeParse(process.env);

if (!resultado.success) {
  console.error(resultado.error.issues);
  process.exit(1);
}

export const env = Object.freeze(resultado.data);
```

### `config/db.js`
Instancia **única** de `PrismaClient`. Nadie más la crea.

```js
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
```

### `repositories/*.repository.js`
Única capa que conoce Prisma. Expone métodos con nombres de negocio (`findByEmail`, `create`, etc.).

```js
import { prisma } from '../config/db.js';

export const usersRepository = {
  findAll: () => prisma.user.findMany(),
  findById: (id) => prisma.user.findUnique({ where: { id } }),
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  create: (data) => prisma.user.create({ data }),
};
```

### `services/*.service.js`
Lógica de negocio pura. Recibe el repositorio por inyección. **No conoce `req`, `res` ni Prisma.**

```js
import { usersRepository } from '../repositories/users.repository.js';
import { ApiError } from '../utils/ApiError.js';

export const usersService = {
  async getById(id) {
    const user = await usersRepository.findById(id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');
    return user;
  },

  async create({ name, email }) {
    if (!name || name.trim().length < 2) {
      throw new ApiError(400, 'El nombre debe tener al menos 2 caracteres');
    }
    const existing = await usersRepository.findByEmail(email);
    if (existing) throw new ApiError(409, 'El email ya está registrado');
    return usersRepository.create({ name: name.trim(), email });
  },
};
```

### `controllers/*.controller.js`
Traduce HTTP ↔ servicio. **Cero lógica de negocio.**

```js
import { usersService } from '../services/users.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const usersController = {
  getById: asyncHandler(async (req, res) => {
    const user = await usersService.getById(req.params.id);
    res.json(user);
  }),

  create: asyncHandler(async (req, res) => {
    const user = await usersService.create(req.body);
    res.status(201).json(user);
  }),
};
```

### `routes/*.routes.js`
Solo define endpoints y conecta middlewares + controller.

```js
import { Router } from 'express';
import { usersController } from '../controllers/users.controller.js';
import { validate } from '../middlewares/validate.js';
import { createUserSchema } from '../schemas/users.schema.js';

const router = Router();

router.get('/:id', usersController.getById);
router.post('/', validate(createUserSchema), usersController.create);

export default router;
```

### `routes/index.js`
Monta todos los dominios bajo `/api`.

```js
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

export default router;
```

### `middlewares/validate.js`
Valida `body`, `params` o `query` con Zod y devuelve 400 con detalle si falla.

```js
import { ApiError } from '../utils/ApiError.js';

export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const resultado = schema.safeParse(req[source]);

    if (!resultado.success) {
      return next(
        new ApiError(400, 'Validación fallida', resultado.error.flatten().fieldErrors),
      );
    }

    req[source] = resultado.data;
    return next();
  };
```

### `middlewares/authenticate.js`
Verifica el JWT y carga el usuario vigente en `req.usuario`.

```js
import { authService } from '../services/auth.service.js';
import { ApiError } from '../utils/ApiError.js';

export const authenticate = async (req, _res, next) => {
  try {
    const [esquema, token] = (req.headers.authorization ?? '').split(' ');

    if (esquema !== 'Bearer' || !token) {
      throw new ApiError(401, 'Token de autenticación requerido');
    }

    req.usuario = await authService.autenticar(token);
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'Token inválido o expirado'));
  }
};
```

### `middlewares/authorize.js`
Restringe por rol después de `authenticate`. Roles: `JEFE`, `ANALISTA`.

```js
import { ApiError } from '../utils/ApiError.js';

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.usuario) return next(new ApiError(401, 'Autenticación requerida'));

    if (roles.length > 0 && !roles.includes(req.usuario.rol)) {
      return next(new ApiError(403, 'No tienes permisos para realizar esta acción'));
    }

    return next();
  };
```

### `middlewares/errorHandler.js`
Último middleware. Formato de error consistente para toda la API.

```js
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, _next) => {
  const status = err instanceof ApiError ? err.status : 500;
  const message = err instanceof ApiError ? err.message : 'Error interno';

  if (env.NODE_ENV !== 'test') {
    console.error(`[${status}] ${message}`, err.stack);
  }

  res.status(status).json({
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

### `utils/ApiError.js`
Clase de error con código HTTP.

```js
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
```

### `app.js`
Configura Express **sin** `listen`. Testeable con Supertest.

```js
import express from 'express';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);

export default app;
```

### `server.js`
Único archivo que arranca el servidor.

```js
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
});
```

---

## 5. Flujo de una petición

```
Cliente → Route → authenticate/authorize → validate (Zod) → Controller → Service → Repository → Prisma → DB
                                         ↓
                                    ApiError → errorHandler → Cliente
```

`authenticate`/`authorize` solo aplican a rutas privadas; `health` y `login` son públicas.

Cada capa solo conoce a la inmediatamente inferior. Ninguna salta capas.

---

## 6. Reglas para agregar un dominio nuevo

Para agregar, por ejemplo, `orders`:

1. Crear `src/routes/orders.routes.js`
2. Crear `src/controllers/orders.controller.js`
3. Crear `src/services/orders.service.js`
4. Crear `src/repositories/orders.repository.js`
5. Crear `src/schemas/orders.schema.js` (Zod)
6. Agregar el modelo en `prisma/schema.prisma`
7. Montar la ruta en `src/routes/index.js`

**No se modifica ningún archivo de otros dominios.**

---

## 7. Manejo de errores

- Todo error esperado usa `ApiError(status, message)`.
- Todo error inesperado cae como `500` en `errorHandler`.
- Nunca exponer stack traces en producción.
- Nunca `res.status(...).json(...)` directamente en services.
- Códigos de estado estándar: `400` validación, `401` no autenticado, `403` sin permisos, `404` no encontrado, `409` conflicto, `500` interno.
- `errorHandler` traduce además errores de Prisma (`P2002` → 409, `P2025` → 404, `P2003` → 409), JWT inválido/expirado → 401 y JSON malformado → 400.

---

## 8. Variables de entorno

Siempre definir en `.env.example`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
JWT_SECRET=secreto-de-al-menos-32-caracteres
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:4200
BCRYPT_ROUNDS=10
SEED_PASSWORD=SicovCI2*2026
```

`env.js` valida que existan y tengan el formato correcto. Si falta `DATABASE_URL` o `JWT_SECRET` (mínimo 32 caracteres), el servidor **no debe arrancar**.

`SEED_PASSWORD` solo lo consume `prisma/seed.js`; no lo valida `env.js`.

---

## 9. Si se migra a TypeScript (opcional)

Mantener la misma estructura, agregando:

- `src/types/` para interfaces (`IUser`, `IUserRepository`).
- Los repositorios implementan `IUserRepository` (útil para tests con mocks).
- Zod genera tipos con `z.infer<typeof schema>`.

No es obligatorio para la demo, pero la estructura actual lo permite sin refactor.

---

## 10. Checklist antes de generar/entregar código

Un agente IA debe verificar:

- [ ] ¿El código nuevo respeta la estructura de carpetas (§3)?
- [ ] ¿La lógica de negocio está en `services/`, no en `controllers/` ni `routes/`?
- [ ] ¿El acceso a Prisma está **solo** en `repositories/`?
- [ ] ¿La entrada HTTP está validada con Zod en `middlewares/validate.js`?
- [ ] ¿Los errores usan `ApiError` y se propagan con `next(err)`?
- [ ] ¿Las rutas privadas usan `authenticate` y, si aplica, `authorize`?
- [ ] ¿La respuesta omite `passwordHash` y cualquier dato sensible?
- [ ] ¿Se agregó la ruta al router correspondiente sin tocar otros dominios?
- [ ] ¿Se actualizó `.env.example` si hay una variable nueva?
- [ ] ¿El servicio es testeable inyectándole un repositorio fake? (aunque no haya tests aún)

---

## 11. Anti-patrones a evitar

| ❌ Anti-patrón | ✅ Correcto |
|---|---|
| `prisma.user.findMany()` en un controller | Llamar al service, que llama al repository |
| `res.status(500).json(...)` en un service | Lanzar `ApiError`, dejar que el handler responda |
| `try/catch` repetido en cada método del service | Propagar y centralizar en `errorHandler` |
| Instanciar `PrismaClient` fuera de `config/db.js` | Importar `prisma` desde `config/db.js` |
| Validar con `if` dentro del controller | Usar middleware `validate` con Zod |
| Devolver `passwordHash` o el usuario completo de Prisma | Mapear a un objeto público en el service |
| Comprobar roles con `if` dentro del controller | Usar `authorize('JEFE')` en la ruta |
| Mezclar dominios en un mismo archivo | Un archivo por capa por dominio |
| `app.listen()` en `app.js` | `listen` solo en `server.js` |

---

## 12. Comandos de referencia

```bash
# Desarrollo
npm install
npm run dev                # nodemon src/server.js
npm start                  # node src/server.js

# Prisma
npm run prisma:generate    # Genera el cliente
npm run prisma:migrate     # Crea/aplica migración en desarrollo
npm run prisma:deploy      # Aplica migraciones en producción
npm run prisma:seed        # Carga los datos iniciales
npm run prisma:studio      # UI para ver datos

# Pruebas
# No hay runner por decisión del proyecto. La verificación es manual contra la API.
```