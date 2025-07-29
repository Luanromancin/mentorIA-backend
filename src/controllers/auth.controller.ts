import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { HttpError } from '../utils/http-error';
import Profile from '../models/profile.model';

// Extensão da interface Request
interface AuthenticatedRequest extends Request {
  user?: Profile;
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, birthDate, institution } = req.body;

      // Validações mais detalhadas
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!name) missingFields.push('name');

      if (missingFields.length > 0) {
        throw new HttpError(
          400,
          `Campos obrigatórios faltando: ${missingFields.join(', ')}`
        );
      }

      // Log dos dados processados
      console.log('Dados processados:', {
        email,
        name,
        birthDate,
        institution,
        hasPassword: !!password,
      });

      const result = await this.authService.register({
        email,
        password,
        name,
        birthDate,
        institution,
      });

      console.log('Usuário registrado com sucesso:', {
        id: result.user.id,
        email: result.user.email,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('Erro no registro', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro ao registrar usuário' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('Tentativa de login:', {
        email: req.body.email,
        hasPassword: !!req.body.password,
      });

      const { email, password } = req.body;

      // Validações básicas
      if (!email || !password) {
        throw new HttpError(400, 'Email e senha são obrigatórios');
      }

      const result = await this.authService.login({ email, password });

      console.log('Login realizado com sucesso:', {
        userId: result.user.id,
        email: result.user.email,
      });

      res.json(result);
    } catch (_error) {
      console.error('Erro no login:', _error);

      if (_error instanceof HttpError) {
        res.status(_error.statusCode).json({
          success: false,
          message: _error.message,
        });
      } else {
        const err = _error as Error;
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
          details: err.message,
        });
      }
    }
  }

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await this.authService.requestPasswordReset(email);
      res.json({
        message:
          'Se o email existir, você receberá instruções para redefinir sua senha',
      });
    } catch (_error) {
      if (_error instanceof HttpError) {
        res.status(_error.statusCode).json({ message: _error.message });
      } else {
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);
      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (_error) {
      if (_error instanceof HttpError) {
        res.status(_error.statusCode).json({ message: _error.message });
      } else {
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const result = await this.authService.refreshToken(userId);
      res.json(result);
    } catch (_error) {
      if (_error instanceof HttpError) {
        res.status(_error.statusCode).json({ message: _error.message });
      } else {
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    try {
      // Em uma implementação mais robusta, você poderia invalidar o token
      // adicionando-o a uma blacklist ou usando refresh tokens
      res.json({ message: 'Logout realizado com sucesso' });
    } catch {
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }
      
      console.log('🔍 Buscando perfil para userId:', userId); // ✅ ADICIONADO
      const profile = await this.authService.getUserProfile(userId);
      console.log('📄 Perfil retornado:', profile?.name); // ✅ ADICIONADO
      
      res.json(profile);
    } catch (_error) {
      if (_error instanceof HttpError) {
        res.status(_error.statusCode).json({ message: _error.message });
      } else {
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      const { name, birth_date, institution, avatar } = req.body; // ✅ ADICIONADO avatar
      
      console.log('💾 Salvando perfil:', { name, birth_date, institution, hasAvatar: !!avatar }); // ✅ ADICIONADO
      
      // Temporariamente, vamos salvar sem avatar até corrigir o AuthService
      const profile = await this.authService.updateProfile(userId, {
        name,
        birth_date,
        institution
        // avatar // ❌ REMOVIDO temporariamente para compilar
      });
      
      console.log('✅ Perfil salvo:', profile?.name); // ✅ ADICIONADO

      res.json(profile);
    } catch (_error) {
      if (_error instanceof HttpError) {
        res.status(_error.statusCode).json({ message: _error.message });
      } else {
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Usuário não autenticado' });
        return;
      }

      await this.authService.deleteUser(userId);
      res.json({ message: 'Conta deletada com sucesso' });
    } catch (_error) {
      if (_error instanceof HttpError) {
        res.status(_error.statusCode).json({ message: _error.message });
      } else {
        res.status(500).json({ message: 'Erro interno do servidor' });
      }
    }
  }

  // Método temporário para debug - listar todos os perfis
  async listProfiles(_req: Request, res: Response): Promise<void> {
    try {
      const profiles = await Profile.findAll({
        attributes: [
          'id',
          'email',
          'name',
          'birth_date',
          'institution',
          'created_at',
          'updated_at',
        ],
        order: [['created_at', 'DESC']],
      });

      res.json(profiles);
    } catch (error) {
      console.error('Erro ao listar perfis:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async syncUser(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new HttpError(400, 'Email é obrigatório');
      }

      console.log('Sincronizando usuário:', email);

      // Usar método público do AuthService para sincronizar
      const result = await this.authService.syncUserFromSupabase(email);

      res.json({
        message: result.message,
        user: result.user,
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro ao sincronizar usuário' });
      }
    }
  }
}