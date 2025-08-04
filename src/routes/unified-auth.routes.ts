import { Router } from 'express';
import UnifiedAuthController from '../controllers/unified-auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

const router = Router();
const authController = UnifiedAuthController;

// Rotas públicas
router.post(
  '/register',
  validate(RegisterDto),
  authController.register.bind(authController)
);

router.post(
  '/login',
  validate(LoginDto),
  authController.login.bind(authController)
);

router.post(
  '/forgot-password',
  authController.requestPasswordReset.bind(authController)
);

// Rota para debug - listar perfis (remover em produção)
router.get('/profiles', authController.listProfiles.bind(authController));

// Rotas protegidas (requerem autenticação via token)
router.get('/me', authController.me.bind(authController));

router.put(
  '/profile',
  authController.updateProfile.bind(authController)
);

router.post('/logout', authController.logout.bind(authController));

export default router; 