import { prisma } from '../config/db.js';

export const usuariosRepository = {
  findById: (id) => prisma.usuario.findUnique({ where: { id } }),

  findByEmail: (email) => prisma.usuario.findUnique({ where: { email } }),

  create: (data) => prisma.usuario.create({ data }),

  updateUltimoAcceso: (id, fecha = new Date()) =>
    prisma.usuario.update({ where: { id }, data: { ultimoAcceso: fecha } }),
};
