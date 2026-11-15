import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { ApiError } from '../utils/ApiError.js';
import { firmarToken, verificarToken } from '../utils/jwt.js';

function aUsuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    esJefe: usuario.rol === 'JEFE',
    activo: usuario.activo,
    ultimoAcceso: usuario.ultimoAcceso,
  };
}

function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

export const authService = {
  async login({ email, password }) {
    const usuario = await usuariosRepository.findByEmail(normalizarEmail(email));

    if (!usuario) {
      throw new ApiError(401, 'Credenciales invalidas');
    }

    if (!usuario.activo) {
      throw new ApiError(403, 'El usuario esta inactivo');
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);

    if (!passwordValida) {
      throw new ApiError(401, 'Credenciales invalidas');
    }

    const actualizado = await usuariosRepository.updateUltimoAcceso(usuario.id);

    return {
      token: firmarToken(actualizado),
      usuario: aUsuarioPublico(actualizado),
    };
  },

  async registrar({ nombre, email, password, rol }) {
    const emailNormalizado = normalizarEmail(email);
    const existente = await usuariosRepository.findByEmail(emailNormalizado);

    if (existente) {
      throw new ApiError(409, 'El email ya esta registrado');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    const usuario = await usuariosRepository.create({
      nombre: nombre.trim(),
      email: emailNormalizado,
      passwordHash,
      rol,
    });

    return aUsuarioPublico(usuario);
  },

  async obtenerPorId(id) {
    const usuario = await usuariosRepository.findById(id);

    if (!usuario) {
      throw new ApiError(404, 'Usuario no encontrado');
    }

    return aUsuarioPublico(usuario);
  },

  /**
   * Valida el token y devuelve el usuario vigente. Se usa en `authenticate`.
   */
  async autenticar(token) {
    const payload = verificarToken(token);
    const usuario = await usuariosRepository.findById(payload.sub);

    if (!usuario) {
      throw new ApiError(401, 'El usuario del token no existe');
    }

    if (!usuario.activo) {
      throw new ApiError(403, 'El usuario esta inactivo');
    }

    return aUsuarioPublico(usuario);
  },
};
