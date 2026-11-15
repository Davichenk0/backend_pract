/**
 * Envuelve un handler asincrono y propaga cualquier rechazo a `next(err)`.
 * Evita repetir try/catch en cada controller.
 */
export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
