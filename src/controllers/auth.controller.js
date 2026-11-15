import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authController = {
  login: asyncHandler(async (req, res) => {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  }),

  me: asyncHandler(async (req, res) => {
    const usuario = await authService.obtenerPorId(req.usuario.id);
    res.json(usuario);
  }),

  registro: asyncHandler(async (req, res) => {
    const usuario = await authService.registrar(req.body);
    res.status(201).json(usuario);
  }),
};
