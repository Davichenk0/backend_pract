import { ApiError } from '../utils/ApiError.js';

/**
 * Restringe el acceso a los roles indicados. Debe usarse siempre despues de
 * `authenticate`. Los roles del dominio son `JEFE` y `ANALISTA`.
 */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.usuario) {
      return next(new ApiError(401, 'Autenticacion requerida'));
    }

    if (roles.length > 0 && !roles.includes(req.usuario.rol)) {
      return next(new ApiError(403, 'No tienes permisos para realizar esta accion'));
    }

    return next();
  };
