import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.PORT, () => {
  logger.info(`Servidor SICOV CI2 escuchando en http://localhost:${env.PORT}/api`);
  logger.info(`Entorno: ${env.NODE_ENV}`);
});

async function cerrar(senal) {
  logger.info(`Senal ${senal} recibida. Cerrando servidor...`);

  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Servidor detenido.');
    process.exit(0);
  });
}

process.on('SIGINT', () => cerrar('SIGINT'));
process.on('SIGTERM', () => cerrar('SIGTERM'));
