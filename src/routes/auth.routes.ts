import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// Rotas públicas
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post(
  '/forgot-password',
  authController.requestPasswordReset.bind(authController)
);
router.post(
  '/reset-password',
  authController.resetPassword.bind(authController)
);

// Rota temporária para debug - listar usuários
router.get('/users', authController.listUsers.bind(authController));

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

export default router;
