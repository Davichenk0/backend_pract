import { ApiError } from '../utils/ApiError.js';

/**
 * Valida una parte de la peticion con un schema Zod.
 *
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body' | 'params' | 'query'} [source='body']
 */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const resultado = schema.safeParse(req[source]);

    if (!resultado.success) {
      return next(
        new ApiError(400, 'Validacion fallida', resultado.error.flatten().fieldErrors),
      );
    }

    req[source] = resultado.data;
    return next();
  };
