import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '../utils/http-error';
import env from '../env';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthDate?: string;
  institution?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    birthDate: string;
    institution: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  refreshToken?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  institution?: string;
  created_at: string;
  updated_at: string;
}

export class UnifiedAuthService {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor() {
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    this.adminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  /**
   * Registra um novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('🚀 Iniciando registro unificado:', {
        email: data.email,
        name: data.name,
        hasPassword: !!data.password,
      });

      // 1. Registrar usuário no Supabase Auth
      const { data: authData, error: authError } = await this.client.auth.signUp({
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
        throw new HttpError(400, authError.message);
      }

      if (!authData.user) {
        throw new HttpError(500, 'Erro ao criar usuário no Supabase Auth');
      }

      console.log('✅ Usuário criado no Supabase Auth:', authData.user.id);

      // 2. Aguardar um pouco para o trigger criar o perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Buscar o perfil criado pelo trigger
      const { data: profile, error: profileError } = await this.adminClient
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erro ao buscar perfil criado:', profileError);
        
        // Tentar criar o perfil manualmente se o trigger falhou
        console.log('🔄 Tentando criar perfil manualmente...');
        const { error: manualProfileError } = await this.adminClient
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            institution: data.institution,
          });

        if (manualProfileError) {
          console.error('❌ Erro ao criar perfil manualmente:', manualProfileError);
          throw new HttpError(500, 'Erro ao criar perfil do usuário');
        }

        // Buscar o perfil novamente
        const { data: newProfile, error: newProfileError } = await this.adminClient
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (newProfileError || !newProfile) {
          throw new HttpError(500, 'Erro ao recuperar perfil criado');
        }

        // profile = newProfile; // This line was removed as per the edit hint
      }

             console.log('✅ Perfil criado/recuperado com sucesso:', profile.id);

       // 4. Sistema de competências otimizado (dados esparsos)
       console.log('🎯 Sistema de competências otimizado - dados esparsos ativados');
       console.log('⚡ Nível 0 = implícito (não armazenado no banco)');
       console.log('⚡ Apenas níveis > 0 são persistidos para melhor performance');

      return {
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          birthDate: data.birthDate || '',
          institution: profile.institution || '',
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token,
      };
    } catch (error) {
      console.error('❌ Erro no registro unificado:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro interno no registro');
    }
  }

  /**
   * Faz login do usuário
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔐 Iniciando login unificado:', { email: data.email });

      // 1. Fazer login no Supabase Auth
      const { data: authData, error: authError } = await this.client.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('❌ Erro no login do Supabase Auth:', authError);
        throw new HttpError(401, 'Credenciais inválidas');
      }

      if (!authData.user) {
        throw new HttpError(500, 'Erro ao fazer login');
      }

      console.log('✅ Login realizado no Supabase Auth:', authData.user.id);

      // 2. Buscar perfil do usuário
      const { data: profile, error: profileError } = await this.adminClient
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        
        // Se o perfil não existe, criar um básico
        console.log('🔄 Perfil não encontrado, criando perfil básico...');
        const { error: createError } = await this.adminClient
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata?.name || 'Usuário',
            institution: authData.user.user_metadata?.institution || '',
          });

        if (createError) {
          console.error('❌ Erro ao criar perfil básico:', createError);
          throw new HttpError(500, 'Erro ao criar perfil do usuário');
        }

        // Buscar o perfil criado
        const { data: newProfile, error: newProfileError } = await this.adminClient
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (newProfileError || !newProfile) {
          throw new HttpError(500, 'Erro ao recuperar perfil criado');
        }

                 profile = newProfile;
         
         // Sistema de competências otimizado (dados esparsos)
         console.log('🎯 Sistema de competências otimizado - dados esparsos ativados');
         console.log('⚡ Nível 0 = implícito (não armazenado no banco)');
         console.log('⚡ Apenas níveis > 0 são persistidos para melhor performance');
      }

      console.log('✅ Perfil recuperado com sucesso:', profile.id);

      return {
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          birthDate: profile.birth_date || '',
          institution: profile.institution || '',
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        },
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token,
      };
    } catch (error) {
      console.error('❌ Erro no login unificado:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro interno no login');
    }
  }

  /**
   * Busca o perfil do usuário atual
   */
  async getCurrentUser(token: string): Promise<Profile> {
    try {
      // 1. Verificar token no Supabase
      const { data: { user }, error: authError } = await this.client.auth.getUser(token);

      if (authError || !user) {
        throw new HttpError(401, 'Token inválido');
      }

      // 2. Buscar perfil
      const { data: profile, error: profileError } = await this.adminClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new HttpError(404, 'Perfil não encontrado');
      }

      return profile;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro ao buscar usuário atual');
    }
  }

  /**
   * Atualiza o perfil do usuário
   */
  async updateProfile(token: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      // 1. Verificar token e obter usuário
      const { data: { user }, error: authError } = await this.client.auth.getUser(token);

      if (authError || !user) {
        throw new HttpError(401, 'Token inválido');
      }

      // 2. Atualizar perfil
      const { data: profile, error: profileError } = await this.adminClient
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (profileError || !profile) {
        throw new HttpError(500, 'Erro ao atualizar perfil');
      }

      return profile;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro ao atualizar perfil');
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout(_token: string): Promise<void> {
    try {
      await this.client.auth.signOut();
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Não falhar o logout mesmo se houver erro
    }
  }

  /**
   * Solicita reset de senha
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.FRONTEND_URL}/reset-password`,
      });

      if (error) {
        throw new HttpError(400, error.message);
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro ao solicitar reset de senha');
    }
  }

  /**
   * Lista todos os perfis (apenas para debug/admin)
   */
  async listProfiles(): Promise<Profile[]> {
    try {
      const { data: profiles, error } = await this.adminClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpError(500, 'Erro ao listar perfis');
      }

      return profiles || [];
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      throw new HttpError(500, 'Erro interno ao listar perfis');
    }
  }


}

export default new UnifiedAuthService(); 