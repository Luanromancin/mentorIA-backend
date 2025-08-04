import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import env from '../env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação não fornecido',
        code: 401
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verificar token no Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido',
        code: 401
      });
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ 
        success: false, 
        message: 'Perfil não encontrado',
        code: 404
      });
    }

    // Adicionar dados do usuário à requisição
    (req as any).user = {
      id: user.id,
      email: user.email,
      name: profile.name,
      profile: profile
    };

    console.log(`🔐 Usuário autenticado: ${profile.name} (${user.id}) - Email: ${user.email}`);
    return next();
  } catch (error) {
    console.error('❌ Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno de autenticação',
      code: 500
    });
  }
};
