import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Los dominios de negocio (programacion, novedades, informes...) se montan aqui
// a medida que se implementan, sin modificar los existentes.

export default router;
