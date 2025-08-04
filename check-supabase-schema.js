const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSupabaseSchema() {
  console.log('🔍 Verificando schema do Supabase...\n');

  try {
    // 1. Verificar estrutura da tabela profiles
    console.log('1️⃣ Verificando estrutura da tabela profiles...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Erro ao verificar tabela profiles:', profilesError);
    } else {
      console.log('✅ Tabela profiles existe e está acessível');
    }

    // 2. Verificar se o trigger existe
    console.log('\n2️⃣ Verificando triggers...');
    
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers_info');

    if (triggersError) {
      console.log('⚠️ Não foi possível verificar triggers via RPC, tentando método alternativo...');
      
      // Tentar criar um usuário de teste para ver se o trigger funciona
      console.log('🔄 Testando trigger com criação de usuário...');
      
      const testEmail = `trigger-test-${Date.now()}@example.com`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'test123456',
        email_confirm: true,
        user_metadata: {
          name: 'Trigger Test',
          institution: 'Test Institution',
        },
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário de teste:', authError);
      } else {
        console.log('✅ Usuário de teste criado:', authData.user.id);
        
        // Aguardar um pouco para o trigger funcionar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar se o perfil foi criado
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.log('❌ Trigger não criou perfil automaticamente');
          console.log('🔄 Criando perfil manualmente...');
          
          const { error: manualError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: testEmail,
              name: 'Trigger Test',
              institution: 'Test Institution',
            });

          if (manualError) {
            console.error('❌ Erro ao criar perfil manualmente:', manualError);
          } else {
            console.log('✅ Perfil criado manualmente');
          }
        } else {
          console.log('✅ Trigger funcionou! Perfil criado automaticamente');
          console.log('📝 Dados do perfil:', {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            institution: profile.institution,
          });
        }

        // Limpar usuário de teste
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('🧹 Usuário de teste removido');
      }
    } else {
      console.log('✅ Triggers encontrados:', triggers);
    }

    // 3. Verificar políticas RLS
    console.log('\n3️⃣ Verificando políticas RLS...');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_info');

    if (policiesError) {
      console.log('⚠️ Não foi possível verificar políticas via RPC');
    } else {
      console.log('✅ Políticas encontradas:', policies);
    }

    // 4. Verificar permissões
    console.log('\n4️⃣ Verificando permissões...');
    
    try {
      const { data: testInsert, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test-permissions@example.com',
          name: 'Test Permissions',
        });

      if (insertError) {
        console.log('⚠️ Erro ao testar inserção:', insertError.message);
      } else {
        console.log('✅ Permissões de inserção funcionando');
        
        // Limpar teste
        await supabase
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (error) {
      console.log('⚠️ Erro ao testar permissões:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkSupabaseSchema(); 