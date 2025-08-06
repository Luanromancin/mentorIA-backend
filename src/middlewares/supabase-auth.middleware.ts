import { Request, Response, NextFunction } from 'express';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { HttpError } from '../utils/http-error';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class SupabaseAuthMiddleware {
  private authService: SupabaseAuthService;

  constructor() {
    this.authService = new SupabaseAuthService();
  }

  async authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log('🔐 Middleware de autenticação executado');
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        console.log('❌ Token não fornecido');
        res.status(401).json({
          success: false,
          message: 'Token não fornecido',
        });
        return;
      }

      console.log('🔍 Validando token...');
      const user = await this.authService.validateToken(token);
      console.log('✅ Token válido, usuário:', user?.id);
      req.user = user;
      return next();
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);

      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
  }

  async optionalAuthenticate(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        const user = await this.authService.validateToken(token);
        req.user = user;
      }

      return next();
    } catch (error) {
      // Para autenticação opcional, apenas ignora o erro e continua
      console.warn('Token inválido na autenticação opcional:', error);
      return next();
    }
  }
}
