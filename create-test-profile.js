const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseServiceKey);

async function createTestProfile() {
  const userId = '550e8400-e29b-41d4-a716-446655440000'; // UUID de teste
  
  console.log(`🔧 Criando perfil de teste para usuário: ${userId}`);
  
  try {
    // Verificar se o perfil já existe
    console.log('1️⃣ Verificando se o perfil já existe...');
    const { data: existingProfile, error: checkError } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar perfil existente:', checkError);
      return;
    }

    if (existingProfile) {
      console.log('✅ Perfil já existe!');
      console.log('Perfil:', existingProfile);
      return;
    }

    // Criar novo perfil com a estrutura correta
    console.log('2️⃣ Criando novo perfil...');
    const newProfile = {
      id: userId,
      email: 'teste@mentoria.com',
      name: 'Usuário de Teste',
      institution: 'Instituto de Teste',
      has_completed_leveling_test: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: createdProfile, error: createError } = await client
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar perfil:', createError);
      return;
    }

    console.log('✅ Perfil criado com sucesso!');
    console.log('Perfil:', createdProfile);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTestProfile(); 