import { z } from 'zod';

const emailSchema = z
  .string({ error: 'El email es obligatorio' })
  .trim()
  .toLowerCase()
  .email('Ingresa un email valido');

const passwordSchema = z
  .string({ error: 'La contrasena es obligatoria' })
  .min(1, 'La contrasena es obligatoria')
  .max(72, 'La contrasena no puede superar 72 caracteres');

export const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const registroSchema = z
  .object({
    nombre: z
      .string({ error: 'El nombre es obligatorio' })
      .trim()
      .min(3, 'El nombre debe tener al menos 3 caracteres')
      .max(80, 'El nombre no puede superar 80 caracteres'),
    email: emailSchema,
    password: z
      .string({ error: 'La contrasena es obligatoria' })
      .min(8, 'La contrasena debe tener al menos 8 caracteres')
      .max(72, 'La contrasena no puede superar 72 caracteres'),
    rol: z
      .enum(['JEFE', 'ANALISTA'], {
        error: 'El rol debe ser JEFE o ANALISTA',
      })
      .default('ANALISTA'),
  })
  .strict();
