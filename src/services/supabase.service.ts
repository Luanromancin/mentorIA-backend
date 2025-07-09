import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import env from '../env';

export interface SupabaseUser {
  id: string;
  email: string;
  name?: string;
  birth_date?: string;
  institution?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseAuthResponse {
  data: {
    user: SupabaseUser | null;
    session: any | null;
  };
  error: any | null;
}

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    console.log('🔧 Inicializando SupabaseService...');
    console.log(
      '🔧 SUPABASE_URL:',
      env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida'
    );
    console.log(
      '🔧 SUPABASE_ANON_KEY:',
      env.SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida'
    );

    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios');
    }

    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    console.log('✅ SupabaseService inicializado com sucesso');
  }

  /**
   * Converte User do Supabase para SupabaseUser
   */
  private convertUser(user: User): SupabaseUser {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name,
      birth_date: user.user_metadata?.birth_date,
      institution: user.user_metadata?.institution,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    };
  }

  /**
   * Cria um novo usuário no Supabase Auth usando signUp
   */
  async createUser(email: string, password: string): Promise<SupabaseUser> {
    console.log('🔧 Tentando criar usuário no Supabase Auth...');
    console.log('🔧 Email:', email);

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${env.SUPABASE_URL}/auth/callback`,
      },
    });

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      // Verificar se é um erro de usuário já existente
      if (
        error.message.includes('User already registered') ||
        error.message.includes('user_already_exists') ||
        error.code === 'user_already_exists'
      ) {
        throw new Error('Email já está em uso');
      }
      throw new Error(`Erro ao criar usuário no Supabase: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Usuário não foi criado no Supabase');
    }

    console.log('✅ Usuário criado no Supabase Auth:', data.user.id);
    return this.convertUser(data.user);
  }

  /**
   * Busca dados do usuário no Supabase Auth por ID
   */
  async getUserById(userId: string): Promise<SupabaseUser | null> {
    console.log('🔧 Buscando usuário no Supabase Auth por ID:', userId);

    const { data, error } = await this.client.auth.admin.getUserById(userId);

    if (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return null;
    }

    if (!data.user) {
      console.log('❌ Usuário não encontrado no Supabase Auth');
      return null;
    }

    console.log('✅ Usuário encontrado no Supabase Auth:', data.user.id);
    return this.convertUser(data.user);
  }

  /**
   * Busca dados do usuário no Supabase Auth por email
   */
  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
    console.log('🔧 Buscando usuário no Supabase Auth por email:', email);

    const { data, error } = await this.client.auth.admin.listUsers();

    if (error) {
      console.error('❌ Erro ao listar usuários:', error);
      return null;
    }

    const user = data.users.find((u) => u.email === email);

    if (!user) {
      console.log('❌ Usuário não encontrado no Supabase Auth');
      return null;
    }

    console.log('✅ Usuário encontrado no Supabase Auth:', user.id);
    return this.convertUser(user);
  }

  /**
   * Faz login no Supabase Auth
   */
  async loginUser(email: string, password: string): Promise<SupabaseUser> {
    console.log('🔧 Tentando fazer login no Supabase Auth...');

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Erro de login do Supabase:', error);
      // Verificar se é um erro de credenciais inválidas
      if (
        error.message.includes('Invalid login credentials') ||
        error.message.includes('invalid_credentials') ||
        error.code === 'invalid_credentials'
      ) {
        throw new Error('Email ou senha incorretos');
      }
      throw new Error(`Erro ao fazer login no Supabase: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('Usuário não encontrado no Supabase');
    }

    console.log('✅ Login realizado no Supabase Auth:', data.user.id);
    return this.convertUser(data.user);
  }

  /**
   * Valida um token JWT do Supabase
   */
  async verifyToken(token: string): Promise<SupabaseUser | null> {
    const { data, error } = await this.client.auth.getUser(token);

    if (error) {
      return null;
    }

    return data.user ? this.convertUser(data.user) : null;
  }

  /**
   * Deleta um usuário do Supabase Auth
   */
  async deleteUser(_id: string): Promise<void> {
    // Para deletar usuários, precisamos usar a API admin
    console.log('🔧 Deletar usuário não implementado ainda');
    throw new Error('Deletar usuário não implementado ainda');
  }

  /**
   * Atualiza a senha de um usuário
   */
  async updatePassword(_id: string, _password: string): Promise<void> {
    // Para atualizar senha, precisamos usar a API admin
    console.log('🔧 Atualizar senha não implementado ainda');
    throw new Error('Atualizar senha não implementado ainda');
  }
}

export default new SupabaseService();
