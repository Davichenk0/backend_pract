import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Firma un JWT con los datos minimos del usuario. El id viaja en `sub`.
 */
export function firmarToken(usuario) {
  return jwt.sign(
    {
      email: usuario.email,
      rol: usuario.rol,
    },
    env.JWT_SECRET,
    {
      subject: usuario.id,
      expiresIn: env.JWT_EXPIRES_IN,
    },
  );
}

/**
 * Verifica la firma y la expiracion. Lanza el error original de jsonwebtoken;
 * el middleware `authenticate` lo traduce a 401.
 */
export function verificarToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
