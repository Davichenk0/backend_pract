import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

function normalizarError(err) {
  if (err instanceof ApiError) {
    return { status: err.status, message: err.message, details: err.details };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const campos = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'unico';
      return { status: 409, message: `Ya existe un registro con el valor unico (${campos})` };
    }

    if (err.code === 'P2025') {
      return { status: 404, message: 'El recurso solicitado no existe' };
    }

    if (err.code === 'P2003') {
      return { status: 409, message: 'La operacion viola una relacion entre registros' };
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return { status: 400, message: 'Los datos enviados no son validos para la base de datos' };
  }

  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return { status: 401, message: 'Token invalido o expirado' };
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return { status: 400, message: 'El cuerpo de la peticion no es un JSON valido' };
  }

  return { status: 500, message: 'Error interno' };
}

export const errorHandler = (err, req, res, _next) => {
  const { status, message, details } = normalizarError(err);

  if (env.NODE_ENV !== 'test') {
    const meta = status >= 500 ? { stack: err.stack } : undefined;
    const registrar = status >= 500 ? logger.error : logger.warn;
    registrar(`${req.method} ${req.originalUrl} -> ${status}: ${message}`, meta);
  }

  res.status(status).json({
    error: message,
    ...(details !== undefined && { details }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
