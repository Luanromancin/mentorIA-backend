import { Router } from 'express';
import { SupabaseAuthController } from '../controllers/supabase-auth.controller';

const router = Router();
const authController = new SupabaseAuthController();

// Rotas de autenticação
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.get(
  '/validate-token',
  authController.validateToken.bind(authController)
);
router.get('/profile', authController.getProfile.bind(authController));

export default router;
