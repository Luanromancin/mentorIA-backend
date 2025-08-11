import { supabase } from '../config/supabase';
import { HttpError } from '../utils/http-error';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthDate?: string;
  institution?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: any;
  token: string;
  refreshToken?: string;
}

export class SupabaseAuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Registrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            birth_date: data.birthDate,
            institution: data.institution,
          },
        },
      });

      if (authError) {
        console.error('❌ Erro no registro do Supabase Auth:', authError);
        
        // Tratar erro de email duplicado especificamente
        if (
          authError.message.includes('User already registered') ||
          authError.message.includes('user_already_exists') ||
          authError.code === 'user_already_exists'
        ) {
          throw new HttpError(400, 'Usuário já cadastrado, use um email diferente');
        }
        
        throw new HttpError(400, authError.message);
      }

      if (!authData.user) {
        throw new HttpError(500, 'Erro ao criar usuário');
      }

      // Criar perfil do usuário na tabela profiles
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          email: data.email,
          name: data.name,
          birth_date: data.birthDate ? new Date(data.birthDate) : null,
          institution: data.institution,
        },
      ]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Não falha o registro se o perfil não for criado
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: data.name,
          birth_date: data.birthDate,
          institution: data.institution,
        },
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro ao registrar usuário');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new HttpError(401, 'Email ou senha incorretos');
      }

      if (!authData.user || !authData.session) {
        throw new HttpError(401, 'Email ou senha incorretos');
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: profile?.name || authData.user.user_metadata?.name,
          birth_date: profile?.birth_date,
          institution: profile?.institution,
        },
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro interno do servidor');
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new HttpError(401, 'Token inválido');
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name,
        birth_date: profile?.birth_date,
        institution: profile?.institution,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(401, 'Token inválido');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new HttpError(401, 'Token de refresh inválido');
      }

      return {
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(401, 'Token de refresh inválido');
    }
  }

  async logout(_token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw new HttpError(404, 'Usuário não encontrado');
      }

      return data;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro interno do servidor');
    }
  }
}
