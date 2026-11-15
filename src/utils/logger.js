import { env } from '../config/env.js';

const NIVELES = { error: 0, warn: 1, info: 2, debug: 3 };
const NIVEL_ACTUAL = env.LOG_LEVEL ?? (env.NODE_ENV === 'production' ? 'info' : 'debug');

function serializar(meta) {
  if (meta === undefined) return undefined;

  const salida = {};

  for (const [clave, valor] of Object.entries(meta)) {
    salida[clave] = valor instanceof Error ? valor.stack ?? valor.message : valor;
  }

  return salida;
}

function escribir(nivel, mensaje, meta) {
  if (NIVELES[nivel] > NIVELES[NIVEL_ACTUAL]) return;

  const entrada = {
    nivel,
    fecha: new Date().toISOString(),
    mensaje,
    ...serializar(meta),
  };

  const linea =
    env.NODE_ENV === 'production' ? JSON.stringify(entrada) : `${entrada.fecha} [${nivel}] ${mensaje}`;

  if (nivel === 'error') {
    console.error(linea, ...(meta ? [meta] : []));
    return;
  }

  if (nivel === 'warn') {
    console.warn(linea, ...(meta ? [meta] : []));
    return;
  }

  console.log(linea, ...(meta ? [meta] : []));
}

export const logger = {
  error: (mensaje, meta) => escribir('error', mensaje, meta),
  warn: (mensaje, meta) => escribir('warn', mensaje, meta),
  info: (mensaje, meta) => escribir('info', mensaje, meta),
  debug: (mensaje, meta) => escribir('debug', mensaje, meta),
};
