import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const authService = new AuthService();
    const user = await authService.validateToken(token);

    // Adiciona o usuário ao objeto request para uso posterior
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}; 