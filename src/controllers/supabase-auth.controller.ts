import { Request, Response } from 'express';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { HttpError } from '../utils/http-error';
import { SuccessResult, FailureResult } from '../utils/result';

export class SupabaseAuthController {
  private authService: SupabaseAuthService;

  constructor() {
    this.authService = new SupabaseAuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, birthDate, institution } = req.body;

      // Validações básicas
      if (!email || !password || !name) {
        new FailureResult({
          msg: 'Email, senha e nome são obrigatórios',
          code: 400,
        }).handle(res);
        return;
      }

      if (password.length < 6) {
        new FailureResult({
          msg: 'A senha deve ter pelo menos 6 caracteres',
          code: 400,
        }).handle(res);
        return;
      }

      const result = await this.authService.register({
        email,
        password,
        name,
        birthDate,
        institution,
      });

      new SuccessResult({
        msg: 'Usuário registrado com sucesso',
        code: 201,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        },
      }).handle(res);
    } catch (error) {
      console.error('Erro no registro:', error);

      if (error instanceof HttpError) {
        new FailureResult({
          msg: error.message,
          code: error.statusCode,
        }).handle(res);
        return;
      }

      new FailureResult({
        msg: 'Erro interno do servidor',
        code: 500,
      }).handle(res);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        new FailureResult({
          msg: 'Email e senha são obrigatórios',
          code: 400,
        }).handle(res);
        return;
      }

      const result = await this.authService.login({ email, password });

      new SuccessResult({
        msg: 'Login realizado com sucesso',
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        },
      }).handle(res);
    } catch (error) {
      console.error('Erro no login:', error);

      if (error instanceof HttpError) {
        new FailureResult({
          msg: error.message,
          code: error.statusCode,
        }).handle(res);
        return;
      }

      new FailureResult({
        msg: 'Erro interno do servidor',
        code: 500,
      }).handle(res);
    }
  }

  async validateToken(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        new FailureResult({
          msg: 'Token não fornecido',
          code: 401,
        }).handle(res);
        return;
      }

      const user = await this.authService.validateToken(token);

      new SuccessResult({
        msg: 'Token válido',
        data: { user },
      }).handle(res);
    } catch (error) {
      console.error('Erro na validação do token:', error);

      if (error instanceof HttpError) {
        new FailureResult({
          msg: error.message,
          code: error.statusCode,
        }).handle(res);
        return;
      }

      new FailureResult({
        msg: 'Erro interno do servidor',
        code: 500,
      }).handle(res);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        new FailureResult({
          msg: 'Refresh token é obrigatório',
          code: 400,
        }).handle(res);
        return;
      }

      const result = await this.authService.refreshToken(refreshToken);

      new SuccessResult({
        msg: 'Token renovado com sucesso',
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        },
      }).handle(res);
    } catch (error) {
      console.error('Erro na renovação do token:', error);

      if (error instanceof HttpError) {
        new FailureResult({
          msg: error.message,
          code: error.statusCode,
        }).handle(res);
        return;
      }

      new FailureResult({
        msg: 'Erro interno do servidor',
        code: 500,
      }).handle(res);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        await this.authService.logout(token);
      }

      new SuccessResult({
        msg: 'Logout realizado com sucesso',
      }).handle(res);
    } catch (error) {
      console.error('Erro no logout:', error);
      new FailureResult({
        msg: 'Erro interno do servidor',
        code: 500,
      }).handle(res);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        new FailureResult({
          msg: 'Token não fornecido',
          code: 401,
        }).handle(res);
        return;
      }

      const user = await this.authService.validateToken(token);
      const profile = await this.authService.getUserProfile(user.id);

      new SuccessResult({
        msg: 'Perfil obtido com sucesso',
        data: { profile },
      }).handle(res);
    } catch (error) {
      console.error('Erro ao obter perfil:', error);

      if (error instanceof HttpError) {
        new FailureResult({
          msg: error.message,
          code: error.statusCode,
        }).handle(res);
        return;
      }

      new FailureResult({
        msg: 'Erro interno do servidor',
        code: 500,
      }).handle(res);
    }
  }
}
