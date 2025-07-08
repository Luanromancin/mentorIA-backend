import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import User from '../models/user.model';

// Extensão da interface Request
interface AuthenticatedRequest extends Request {
  user?: User;
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
    const user = await authService.validateToken(token);

    // Adiciona o usuário ao objeto request para uso posterior
    req.user = user;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
    });
    return;
  }
};
