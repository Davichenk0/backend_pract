import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Instancia unica de PrismaClient. Solo `repositories/` puede importar
 * `prisma` desde este archivo.
 */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
