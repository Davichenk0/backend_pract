import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL es obligatoria')
    .refine(
      (valor) => valor.startsWith('postgresql://') || valor.startsWith('postgres://'),
      'DATABASE_URL debe ser una cadena de conexion de PostgreSQL',
    ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().min(1).default('8h'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:4200'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
});

const resultado = envSchema.safeParse(process.env);

if (!resultado.success) {
  const detalles = resultado.error.issues.map((issue) => ({
    variable: issue.path.join('.'),
    mensaje: issue.message,
  }));

  console.error('Variables de entorno invalidas. El servidor no puede arrancar:');
  console.error(JSON.stringify(detalles, null, 2));
  process.exit(1);
}

export const env = Object.freeze(resultado.data);
