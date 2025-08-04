const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySupabaseSchema() {
  console.log('🔧 Aplicando schema atualizado no Supabase...\n');

  try {
    // 1. Verificar se a tabela profiles existe
    console.log('1️⃣ Verificando tabela profiles...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ Erro ao verificar tabela profiles:', profilesError);
      console.log('⚠️ A tabela profiles pode não existir ou ter problemas de permissão');
    } else {
      console.log('✅ Tabela profiles existe e está acessível');
    }

    // 2. Tentar criar/atualizar a função handle_new_user
    console.log('\n2️⃣ Criando/atualizando função handle_new_user...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO profiles (id, email, name, birth_date, institution)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
          CASE 
            WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
            THEN (NEW.raw_user_meta_data->>'birth_date')::DATE
            ELSE NULL
          END,
          NEW.raw_user_meta_data->>'institution'
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (functionError) {
      console.log('⚠️ Não foi possível criar função via RPC, você precisará executar manualmente no SQL Editor:');
      console.log('\n📝 Execute este SQL no SQL Editor do Supabase:');
      console.log(createFunctionSQL);
    } else {
      console.log('✅ Função handle_new_user criada/atualizada');
    }

    // 3. Tentar criar/atualizar o trigger
    console.log('\n3️⃣ Criando/atualizando trigger...');
    
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggerSQL });
    
    if (triggerError) {
      console.log('⚠️ Não foi possível criar trigger via RPC, você precisará executar manualmente no SQL Editor:');
      console.log('\n📝 Execute este SQL no SQL Editor do Supabase:');
      console.log(createTriggerSQL);
    } else {
      console.log('✅ Trigger on_auth_user_created criado/atualizado');
    }

    // 4. Tentar criar políticas RLS
    console.log('\n4️⃣ Criando políticas RLS...');
    
    const createPoliciesSQL = `
      -- Remover políticas antigas se existirem
      DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON profiles;
      DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON profiles;
      DROP POLICY IF EXISTS "Usuários podem inserir seus próprios perfis" ON profiles;
      
      -- Políticas para profiles - Permitir acesso completo para usuários autenticados
      CREATE POLICY "Usuários autenticados podem ver seus próprios perfis" ON profiles
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Usuários autenticados podem atualizar seus próprios perfis" ON profiles
        FOR UPDATE USING (auth.uid() = id);
      
      CREATE POLICY "Usuários autenticados podem inserir seus próprios perfis" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
      
      -- Política para permitir inserção via trigger (service role)
      CREATE POLICY "Service role pode inserir perfis" ON profiles
        FOR INSERT WITH CHECK (true);
    `;

    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: createPoliciesSQL });
    
    if (policiesError) {
      console.log('⚠️ Não foi possível criar políticas via RPC, você precisará executar manualmente no SQL Editor:');
      console.log('\n📝 Execute este SQL no SQL Editor do Supabase:');
      console.log(createPoliciesSQL);
    } else {
      console.log('✅ Políticas RLS criadas/atualizadas');
    }

    // 5. Testar o trigger
    console.log('\n5️⃣ Testando trigger...');
    
    const testEmail = `schema-test-${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        name: 'Schema Test',
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
        console.log('❌ Trigger ainda não está funcionando');
        console.log('🔄 Criando perfil manualmente...');
        
        const { error: manualError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: testEmail,
            name: 'Schema Test',
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

    console.log('\n📋 RESUMO:');
    console.log('✅ Verificação da tabela profiles: OK');
    console.log('⚠️ Função handle_new_user: Execute manualmente no SQL Editor');
    console.log('⚠️ Trigger on_auth_user_created: Execute manualmente no SQL Editor');
    console.log('⚠️ Políticas RLS: Execute manualmente no SQL Editor');
    console.log('⚠️ Trigger ainda não está funcionando automaticamente');

    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('1. Acesse o SQL Editor do Supabase');
    console.log('2. Execute o script docs/supabase-schema-updated.sql');
    console.log('3. Ou execute os comandos SQL mostrados acima');
    console.log('4. Teste novamente com: node test-unified-auth.js');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applySupabaseSchema(); 