import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

const router = Router();
const authController = new AuthController();

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
router.post(
  '/reset-password',
  authController.resetPassword.bind(authController)
);
router.post('/sync', authController.syncUser.bind(authController));

// Rota temporária para debug - listar perfis
router.get('/profiles', authController.listProfiles.bind(authController));

// Rota para limpar cache (apenas para desenvolvimento)
router.post('/clear-cache', authController.clearAuthCache.bind(authController));

// Rotas protegidas (requerem autenticação)
router.post(
  '/refresh',
  authMiddleware,
  authController.refreshToken.bind(authController)
);
router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
);
router.get('/me', authMiddleware, authController.me.bind(authController));

// Novas rotas para gerenciamento de perfil
router.put(
  '/profile',
  authMiddleware,
  authController.updateProfile.bind(authController)
);
router.delete(
  '/account',
  authMiddleware,
  authController.deleteAccount.bind(authController)
);

export default router;
