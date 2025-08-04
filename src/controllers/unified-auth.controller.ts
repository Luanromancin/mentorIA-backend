import { Request, Response } from 'express';
import UnifiedAuthService, { Profile } from '../services/unified-auth.service';
import { HttpError } from '../utils/http-error';

// Extensão da interface Request
interface AuthenticatedRequest extends Request {
  user?: Profile;
}

export class UnifiedAuthController {
  private authService: typeof UnifiedAuthService;

  constructor() {
    this.authService = UnifiedAuthService;
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, birthDate, institution } = req.body;

      // Validações
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

      console.log('📝 Dados de registro processados:', {
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

      console.log('✅ Usuário registrado com sucesso:', {
        id: result.user.id,
        email: result.user.email,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro interno no registro' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      console.log('🔐 Tentativa de login:', {
        email,
        hasPassword: !!password,
      });

      // Validações básicas
      if (!email || !password) {
        throw new HttpError(400, 'Email e senha são obrigatórios');
      }

      const result = await this.authService.login({ email, password });

      console.log('✅ Login realizado com sucesso:', {
        userId: result.user.id,
        email: result.user.email,
      });

      res.json(result);
    } catch (error) {
      console.error('❌ Erro no login:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno no login',
        });
      }
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new HttpError(401, 'Token não fornecido');
      }

      const user = await this.authService.getCurrentUser(token);
      res.json(user);
    } catch (error) {
      console.error('❌ Erro ao buscar usuário atual:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro interno ao buscar usuário' });
      }
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new HttpError(401, 'Token não fornecido');
      }

      const { name, institution } = req.body;
      const updates: Partial<Profile> = {};

      if (name !== undefined) updates.name = name;
      if (institution !== undefined) updates.institution = institution;

      const updatedProfile = await this.authService.updateProfile(token, updates);

      console.log('✅ Perfil atualizado com sucesso:', {
        id: updatedProfile.id,
        email: updatedProfile.email,
      });

      res.json(updatedProfile);
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro interno ao atualizar perfil' });
      }
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        await this.authService.logout(token);
      }

      console.log('✅ Logout realizado com sucesso');
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Sempre retornar sucesso no logout
      res.json({ message: 'Logout realizado com sucesso' });
    }
  }

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new HttpError(400, 'Email é obrigatório');
      }

      await this.authService.requestPasswordReset(email);

      console.log('✅ Solicitação de reset de senha enviada:', email);
      res.json({ message: 'Email de reset de senha enviado com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao solicitar reset de senha:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro interno ao solicitar reset de senha' });
      }
    }
  }

  async listProfiles(_req: Request, res: Response): Promise<void> {
    try {
      const profiles = await this.authService.listProfiles();

      console.log(`📊 Listando ${profiles.length} perfis`);
      res.json(profiles);
    } catch (error) {
      console.error('❌ Erro ao listar perfis:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro interno ao listar perfis' });
      }
    }
  }
}

export default new UnifiedAuthController(); 