import { authService } from '../services/auth.service.js';
import { ApiError } from '../utils/ApiError.js';

export const authenticate = async (req, _res, next) => {
  try {
    const encabezado = req.headers.authorization ?? '';
    const [esquema, token] = encabezado.split(' ');

    if (esquema !== 'Bearer' || !token) {
      throw new ApiError(401, 'Token de autenticacion requerido');
    }

    req.usuario = await authService.autenticar(token);
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(new ApiError(401, 'Token invalido o expirado'));
  }
};
