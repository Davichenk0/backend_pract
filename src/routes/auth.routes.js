import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, registroSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);
router.post(
  '/registro',
  authenticate,
  authorize('JEFE'),
  validate(registroSchema),
  authController.registro,
);

export default router;
