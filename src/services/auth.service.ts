import Profile from '../models/profile.model';
import ProfileRepository from '../repositories/profile.repository';
import SupabaseService from './supabase.service';
import jwt from 'jsonwebtoken';
import env from '../env';
import { HttpError } from '../utils/http-error';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  institution: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: Profile;
  token: string;
}

interface RefreshTokenResponse {
  token: string;
}

interface JwtPayload {
  id: string;
  email: string;
}

export class AuthService {
  private profileRepository: typeof ProfileRepository;
  private supabaseService: typeof SupabaseService;

  constructor() {
    this.profileRepository = ProfileRepository;
    this.supabaseService = SupabaseService;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Iniciando registro com dados:', {
        ...data,
        password: '***',
        birthDate: data.birthDate,
      });

      // Validação explícita do password
      if (!data.password || data.password.length < 6) {
        throw new HttpError(400, 'Senha deve ter pelo menos 6 caracteres');
      }

      // Verificar se email já existe no perfil
      const existingProfile = await this.profileRepository.findByEmail(
        data.email
      );
      if (existingProfile) {
        throw new HttpError(400, 'Email já está em uso');
      }

      // 1. Criar usuário no Supabase Auth
      console.log('Criando usuário no Supabase Auth...');
      const supabaseUser = await this.supabaseService.createUser(
        data.email,
        data.password
      );

      console.log('Usuário criado no Supabase Auth:', {
        id: supabaseUser.id,
        email: supabaseUser.email,
      });

      // 2. Criar perfil na tabela profiles
      console.log('Criando perfil na tabela profiles...');
      const profile = await this.profileRepository.createProfile({
        id: supabaseUser.id, // Usar o mesmo ID do Supabase Auth
        email: data.email,
        name: data.name,
        birth_date: new Date(data.birthDate),
        institution: data.institution,
      });

      console.log('Perfil criado com sucesso:', {
        id: profile.id,
        email: profile.email,
        name: profile.name,
      });

      // 3. Gerar token JWT
      const token = this.generateToken(profile);

      return { user: profile, token };
    } catch (error) {
      console.error('Erro detalhado no registro:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      // Verificar se é um erro de email já em uso
      if (error.message.includes('Email já está em uso')) {
        throw new HttpError(400, 'Email já está em uso');
      }
      if (error.message.includes('Supabase')) {
        throw new HttpError(400, error.message);
      }
      if (error.name === 'SequelizeValidationError') {
        throw new HttpError(400, 'Dados inválidos: ' + error.message);
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new HttpError(400, 'Email já está em uso');
      }
      throw new HttpError(500, 'Erro ao registrar usuário: ' + error.message);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // 1. Fazer login no Supabase Auth
      console.log('Fazendo login no Supabase Auth...');
      const supabaseUser = await this.supabaseService.loginUser(
        data.email,
        data.password
      );

      // 2. Buscar perfil por email
      let profile = await this.profileRepository.findByEmail(data.email);

      // 3. Se o perfil não existir no banco local, mas o usuário existe no Supabase,
      // criar o perfil automaticamente
      if (!profile && supabaseUser) {
        console.log(
          'Perfil não encontrado no banco local, criando automaticamente...'
        );

        // Buscar dados do usuário no Supabase
        const userData = await this.supabaseService.getUserById(
          supabaseUser.id
        );

        if (userData) {
          profile = await this.profileRepository.createProfile({
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: userData.name || 'Usuário',
            birth_date: userData.birth_date
              ? new Date(userData.birth_date)
              : new Date(),
            institution: userData.institution || '',
          });

          console.log('Perfil criado automaticamente:', {
            id: profile.id,
            email: profile.email,
          });
        } else {
          // Se não conseguimos buscar dados do usuário, criar perfil básico
          console.log(
            '⚠️ Não foi possível buscar dados do usuário no Supabase, criando perfil básico...'
          );
          profile = await this.profileRepository.createProfile({
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: 'Usuário',
            birth_date: new Date(),
            institution: '',
          });

          console.log('Perfil básico criado:', {
            id: profile.id,
            email: profile.email,
          });
        }
      }

      if (!profile) {
        throw new HttpError(401, 'Perfil não encontrado');
      }

      console.log('Usuário autenticado:', {
        id: profile.id,
        email: profile.email,
      });

      // 4. Gerar token JWT
      const token = this.generateToken(profile);

      return { user: profile, token };
    } catch (error) {
      console.error('Erro no login:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      // Verificar se é um erro de credenciais inválidas
      if (error.message.includes('Email ou senha incorretos')) {
        throw new HttpError(401, 'Email ou senha incorretos');
      }
      throw new HttpError(500, 'Erro ao fazer login: ' + error.message);
    }
  }

  private generateToken(profile: Profile): string {
    if (!env.JWT_SECRET) {
      throw new HttpError(500, 'JWT_SECRET não configurado');
    }

    const payload: JwtPayload = {
      id: profile.id,
      email: profile.email,
    };

    try {
      // @ts-expect-error - Ignorando erro de tipagem do JWT
      return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      });
    } catch {
      throw new HttpError(500, 'Erro ao gerar token');
    }
  }

  async validateToken(token: string): Promise<Profile> {
    if (!env.JWT_SECRET) {
      throw new HttpError(500, 'JWT_SECRET não configurado');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const profile = await this.profileRepository.findById(decoded.id);
      if (!profile) {
        throw new HttpError(401, 'Usuário não encontrado');
      }
      return profile;
    } catch {
      throw new HttpError(401, 'Token inválido');
    }
  }

  /**
   * Sincroniza um usuário do Supabase com o banco local
   */
  async syncUserFromSupabase(
    email: string
  ): Promise<{ message: string; user: any }> {
    console.log('Sincronizando usuário do Supabase:', email);

    // 1. Verificar se o usuário existe no Supabase
    const supabaseUser = await this.supabaseService.getUserByEmail(email);

    if (!supabaseUser) {
      throw new HttpError(404, 'Usuário não encontrado no Supabase');
    }

    // 2. Verificar se já existe no banco local
    const existingProfile = await this.profileRepository.findByEmail(email);

    if (existingProfile) {
      return {
        message: 'Usuário já está sincronizado',
        user: existingProfile,
      };
    }

    // 3. Criar perfil no banco local
    const profile = await this.profileRepository.createProfile({
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.name || 'Usuário',
      birth_date: supabaseUser.birth_date
        ? new Date(supabaseUser.birth_date)
        : new Date(),
      institution: supabaseUser.institution || '',
    });

    console.log('Usuário sincronizado com sucesso:', {
      id: profile.id,
      email: profile.email,
    });

    return {
      message: 'Usuário sincronizado com sucesso',
      user: profile,
    };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const profile = await this.profileRepository.findByEmail(email);
    if (!profile) {
      // Por segurança, não revelamos se o email existe ou não
      return;
    }

    // Verificar se usuário existe no Supabase Auth
    await this.supabaseService.getUserById(profile.id);

    // TODO: Implementar reset de senha via Supabase Auth
    console.log(`Solicitação de reset de senha para ${email}`);
  }

  async resetPassword(_token: string, _newPassword: string): Promise<void> {
    // TODO: Implementar reset de senha via Supabase Auth
    throw new HttpError(501, 'Reset de senha não implementado ainda');
  }

  async refreshToken(userId: string): Promise<RefreshTokenResponse> {
    const profile = await this.profileRepository.findById(userId);
    if (!profile) {
      throw new HttpError(401, 'Usuário não encontrado');
    }

    const token = this.generateToken(profile);
    return { token };
  }

  async getUserProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findById(userId);
    if (!profile) {
      throw new HttpError(404, 'Usuário não encontrado');
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      birth_date?: string;
      institution?: string;
    }
  ): Promise<Profile> {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    //if (data.birth_date) updateData.birth_date = new Date(data.birth_date);
    if (data.birth_date) updateData.birth_date = data.birth_date;

    if (data.institution) updateData.institution = data.institution;

    const profile = await this.profileRepository.updateProfile(
      userId,
      updateData
    );
    if (!profile) {
      throw new HttpError(404, 'Usuário não encontrado');
    }

    return profile;
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // 1. Deletar perfil
      const deleted = await this.profileRepository.deleteProfile(userId);
      if (!deleted) {
        throw new HttpError(404, 'Usuário não encontrado');
      }

      // 2. Deletar usuário do Supabase Auth
      await this.supabaseService.deleteUser(userId);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new HttpError(500, 'Erro ao deletar usuário: ' + error.message);
    }
  }
}
