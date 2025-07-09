const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com o Supabase...\n');

  // Verificar variáveis de ambiente
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis de ambiente não configuradas!');
    console.log('Certifique-se de que SUPABASE_URL e SUPABASE_ANON_KEY estão definidas no arquivo .env');
    return;
  }

  console.log('✅ Variáveis de ambiente encontradas');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Anon Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

  try {
    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('🔄 Testando conexão...');

    // Testar conexão básica
    const { data, error } = await supabase.from('profiles').select('count').limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️  Tabela "profiles" não encontrada. Execute o script SQL primeiro.');
        console.log('📝 Execute o conteúdo de docs/supabase-schema.sql no SQL Editor do Supabase');
      } else {
        console.error('❌ Erro na conexão:', error.message);
      }
      return;
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    console.log('✅ Tabela "profiles" encontrada');

    // Testar autenticação
    console.log('\n🔄 Testando autenticação...');
    
    const testEmail = `test-${Date.now()}@gmail.com`;
    const testPassword = 'test123456';

    // Testar registro
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Usuário Teste',
        },
      },
    });

    if (signUpError) {
      console.error('❌ Erro no registro de teste:', signUpError.message);
      return;
    }

    console.log('✅ Registro de teste realizado com sucesso');

    // Testar login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.error('❌ Erro no login de teste:', signInError.message);
      return;
    }

    console.log('✅ Login de teste realizado com sucesso');
    console.log(`✅ Token obtido: ${signInData.session.access_token.substring(0, 20)}...`);

    // Limpar usuário de teste
    const { error: deleteError } = await supabase.auth.admin.deleteUser(signUpData.user.id);
    if (deleteError) {
      console.log('⚠️  Não foi possível deletar o usuário de teste (normal se não tiver service_role key)');
    } else {
      console.log('✅ Usuário de teste removido');
    }

    console.log('\n🎉 Todos os testes passaram! O Supabase está configurado corretamente.');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar teste
testSupabaseConnection(); 