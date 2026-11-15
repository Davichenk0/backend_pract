import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PASSWORD = process.env.SEED_PASSWORD ?? 'SicovCI2*2026';
const RONDAS = Number(process.env.BCRYPT_ROUNDS ?? 10);

/**
 * Equipo inicial definido en `context-general.md` §6.
 * David Gonzalo Cajamarca Torres es el jefe inmediato (autoriza novedades).
 */
const USUARIOS_INICIALES = [
  {
    nombre: 'David Gonzalo Cajamarca Torres',
    email: 'david.cajamarca@sicov.local',
    rol: 'JEFE',
  },
  {
    nombre: 'Ingelyn Samantha Gamboa Ruiz',
    email: 'ingelyn.gamboa@sicov.local',
    rol: 'ANALISTA',
  },
  {
    nombre: 'Emanuel Salazar Bernal',
    email: 'emanuel.salazar@sicov.local',
    rol: 'ANALISTA',
  },
  {
    nombre: 'Johan Felipe Londono Lemus',
    email: 'johan.londono@sicov.local',
    rol: 'ANALISTA',
  },
  {
    nombre: 'Evelyn Ruiz Torres',
    email: 'evelyn.ruiz@sicov.local',
    rol: 'ANALISTA',
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, RONDAS);

  for (const usuario of USUARIOS_INICIALES) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: { nombre: usuario.nombre, rol: usuario.rol },
      create: { ...usuario, passwordHash },
    });
  }

  console.log(`Seed completado: ${USUARIOS_INICIALES.length} usuarios iniciales.`);
  console.log('Contrasena inicial:', PASSWORD);
}

main()
  .catch((error) => {
    console.error('Error ejecutando el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
