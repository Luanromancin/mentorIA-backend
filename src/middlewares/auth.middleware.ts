import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import Profile from '../models/profile.model';

// Extensão da interface Request
interface AuthenticatedRequest extends Request {
  user?: Profile;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const authService = new AuthService();
    const profile = await authService.validateToken(token);

    // Adiciona o perfil ao objeto request para uso posterior
    req.user = profile;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
    return;
  }
};
