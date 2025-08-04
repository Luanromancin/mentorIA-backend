const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFixedLazyLoading() {
  console.log('🚀 Testando Lazy Loading Corrigido\n');
  console.log('📋 Objetivo: Validar que competências são criadas automaticamente na primeira consulta\n');

  try {
    // 1. Criar usuário de teste
    console.log('1️⃣ Criando usuário de teste...');
    
    const testEmail = `lazy-test-${Date.now()}@example.com`;
    const testPassword = 'test123456';
    const testName = 'Usuário Lazy Loading Teste';
    const testInstitution = 'Instituição Teste';

    const startTime = Date.now();
    
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
      console.error('❌ Erro ao criar usuário no Auth:', authError);
      return;
    }

    const userCreationTime = Date.now() - startTime;
    console.log(`✅ Usuário criado em ${userCreationTime}ms`);
    console.log('   📝 ID:', authData.user.id);

    // 2. Criar perfil
    console.log('\n2️⃣ Criando perfil...');
    
    const profileStartTime = Date.now();
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: testEmail,
        name: testName,
        institution: testInstitution,
      });

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError);
      return;
    }

    const profileCreationTime = Date.now() - profileStartTime;
    console.log(`✅ Perfil criado em ${profileCreationTime}ms`);

    // 3. Verificar competências iniciais (deve ser 0)
    console.log('\n3️⃣ Verificando competências iniciais...');
    
    const initialCompetenciesStart = Date.now();
    
    const { data: initialCompetencies, error: initialError } = await supabase
      .from('user_competencies')
      .select('*')
      .eq('profile_id', authData.user.id);

    if (initialError) {
      console.error('❌ Erro ao verificar competências iniciais:', initialError);
      return;
    }

    const initialCompetenciesTime = Date.now() - initialCompetenciesStart;
    console.log(`✅ Competências iniciais verificadas em ${initialCompetenciesTime}ms`);
    console.log(`   📊 Total de competências: ${initialCompetencies.length} (esperado: 0)`);

    // 4. Simular primeira consulta (que deve criar competências automaticamente)
    console.log('\n4️⃣ Simulando primeira consulta (deve criar competências automaticamente)...');
    
    const firstQueryStart = Date.now();
    
    // Simular o que o sistema faria na primeira consulta
    const { data: firstQueryCompetencies, error: firstQueryError } = await supabase
      .from('user_competencies')
      .select(`
        level,
        last_evaluated_at,
        competencies (
          id,
          name,
          code
        )
      `)
      .eq('profile_id', authData.user.id);

    if (firstQueryError) {
      console.error('❌ Erro na primeira consulta:', firstQueryError);
      return;
    }

    const firstQueryTime = Date.now() - firstQueryStart;
    console.log(`✅ Primeira consulta concluída em ${firstQueryTime}ms`);
    console.log(`   📊 Competências encontradas: ${firstQueryCompetencies.length}`);

    if (firstQueryCompetencies.length === 0) {
      console.log('   ⚠️ NENHUMA COMPETÊNCIA CRIADA! Problema ainda existe.');
    } else {
      console.log('   ✅ Competências criadas automaticamente!');
      
      // Mostrar algumas competências como exemplo
      console.log('   📝 Exemplos de competências criadas:');
      firstQueryCompetencies.slice(0, 3).forEach(comp => {
        console.log(`      - ${comp.competencies.name}: Nível ${comp.level}`);
      });
    }

    // 5. Verificar competências após primeira consulta
    console.log('\n5️⃣ Verificando competências após primeira consulta...');
    
    const finalCheckStart = Date.now();
    
    const { data: finalCompetencies, error: finalError } = await supabase
      .from('user_competencies')
      .select('*')
      .eq('profile_id', authData.user.id);

    if (finalError) {
      console.error('❌ Erro ao verificar competências finais:', finalError);
      return;
    }

    const finalCheckTime = Date.now() - finalCheckStart;
    console.log(`✅ Verificação final concluída em ${finalCheckTime}ms`);
    console.log(`   📊 Total de competências: ${finalCompetencies.length}`);

    // 6. Verificar total de competências no sistema
    console.log('\n6️⃣ Verificando total de competências no sistema...');
    
    const { data: allCompetencies, error: allCompetenciesError } = await supabase
      .from('competencies')
      .select('id')
      .order('code');

    if (allCompetenciesError) {
      console.error('❌ Erro ao buscar competências do sistema:', allCompetenciesError);
    } else {
      console.log(`✅ Total de competências no sistema: ${allCompetencies.length}`);
      
      if (finalCompetencies.length === allCompetencies.length) {
        console.log('   ✅ TODAS as competências foram criadas corretamente!');
      } else {
        console.log(`   ⚠️ Faltam ${allCompetencies.length - finalCompetencies.length} competências`);
      }
    }

    // 7. Limpeza
    console.log('\n7️⃣ Limpando dados de teste...');
    
    const cleanupStart = Date.now();
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      authData.user.id
    );

    if (deleteError) {
      console.error('❌ Erro ao deletar usuário:', deleteError);
    } else {
      const cleanupTime = Date.now() - cleanupStart;
      console.log(`✅ Usuário removido em ${cleanupTime}ms`);
    }

    // 8. Resumo final
    const totalTime = Date.now() - startTime;
    
    console.log('\n🎉 TESTE DO LAZY LOADING CORRIGIDO CONCLUÍDO!');
    console.log('\n📊 RESUMO FINAL:');
    console.log(`⏱️  Tempo total: ${totalTime}ms`);
    console.log(`📊 Competências criadas: ${finalCompetencies.length}`);
    console.log(`📊 Competências esperadas: ${allCompetencies?.length || 0}`);

    if (finalCompetencies.length > 0) {
      console.log('\n✅ LAZY LOADING CORRIGIDO FUNCIONANDO:');
      console.log('✅ Competências criadas automaticamente na primeira consulta');
      console.log('✅ Sistema de apostila dinâmica funcionará');
      console.log('✅ Performance mantida (criação sob demanda)');
    } else {
      console.log('\n❌ PROBLEMA AINDA EXISTE:');
      console.log('❌ Competências não foram criadas automaticamente');
      console.log('❌ Sistema de apostila dinâmica não funcionará');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testFixedLazyLoading()
  .then(() => {
    console.log('\n✅ Teste concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  }); 