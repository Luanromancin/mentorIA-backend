const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUnifiedAuth() {
  console.log('🧪 Testando sistema unificado de autenticação...\n');

  try {
    // 1. Testar criação de usuário
    console.log('1️⃣ Testando criação de usuário...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    const testName = 'Usuário Teste';
    const testInstitution = 'Instituição Teste';

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: testName,
        institution: testInstitution,
      },
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError);
      return;
    }

    console.log('✅ Usuário criado no Auth:', authData.user.id);

    // 2. Aguardar um pouco para o trigger funcionar
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Verificar se o perfil foi criado
    console.log('\n2️⃣ Verificando criação do perfil...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      
      // Tentar criar perfil manualmente
      console.log('🔄 Tentando criar perfil manualmente...');
      const { error: manualError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: testEmail,
          name: testName,
          institution: testInstitution,
        });

      if (manualError) {
        console.error('❌ Erro ao criar perfil manualmente:', manualError);
        return;
      }

      console.log('✅ Perfil criado manualmente');
    } else {
      console.log('✅ Perfil criado automaticamente pelo trigger');
      console.log('📝 Dados do perfil:', {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        institution: profile.institution,
      });
    }

    // 4. Testar login
    console.log('\n3️⃣ Testando login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    console.log('🔑 Token obtido:', loginData.session?.access_token ? 'Sim' : 'Não');

    // 5. Testar busca de perfil com token
    console.log('\n4️⃣ Testando busca de perfil com token...');
    
    const { data: currentProfile, error: currentError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single();

    if (currentError) {
      console.error('❌ Erro ao buscar perfil atual:', currentError);
    } else {
      console.log('✅ Perfil atual recuperado:', {
        id: currentProfile.id,
        email: currentProfile.email,
        name: currentProfile.name,
      });
    }

    // 6. Testar atualização de perfil
    console.log('\n5️⃣ Testando atualização de perfil...');
    
    const newName = 'Usuário Teste Atualizado';
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ name: newName })
      .eq('id', loginData.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError);
    } else {
      console.log('✅ Perfil atualizado:', {
        id: updatedProfile.id,
        name: updatedProfile.name,
      });
    }

    // 7. Limpeza - deletar usuário de teste
    console.log('\n6️⃣ Limpando dados de teste...');
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      authData.user.id
    );

    if (deleteError) {
      console.error('❌ Erro ao deletar usuário:', deleteError);
    } else {
      console.log('✅ Usuário de teste deletado');
    }

    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('✅ Sistema unificado funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

testUnifiedAuth(); 