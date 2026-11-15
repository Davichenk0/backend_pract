export class ApiError extends Error {
  /**
   * Error esperado de la aplicacion. El `errorHandler` global lo traduce a
   * una respuesta HTTP con el mismo `status`.
   *
   * @param {number} status Codigo HTTP (400, 401, 403, 404, 409, 500...)
   * @param {string} message Mensaje apto para el cliente
   * @param {unknown} [details] Detalle opcional (por ejemplo errores de Zod)
   */
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;

    if (details !== undefined) {
      this.details = details;
    }
  }
}
