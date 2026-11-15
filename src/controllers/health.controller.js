export const healthController = {
  estado: (_req, res) => {
    res.json({
      estado: 'ok',
      servicio: 'sicov-ci2-backend',
      fecha: new Date().toISOString(),
    });
  },
};
