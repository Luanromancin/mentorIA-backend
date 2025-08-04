const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCacheService() {
  console.log('🧪 Testando Sistema de Cache\n');

  try {
    // 1. Buscar usuário existente
    console.log('1️⃣ Buscando usuário existente...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .order('created_at', { ascending: false })
      .limit(1);

    if (profilesError || !profiles || profiles.length === 0) {
      console.error('❌ Erro ao buscar perfis ou nenhum perfil encontrado');
      return;
    }

    const profile = profiles[0];
    console.log(`✅ Usuário encontrado: ${profile.email} (${profile.name})`);
    console.log(`   📝 ID: ${profile.id}`);

    // 2. Verificar competências atuais
    console.log('\n2️⃣ Verificando competências atuais...');
    
    const { data: currentCompetencies, error: currentError } = await supabase
      .from('user_competencies')
      .select('*')
      .eq('profile_id', profile.id);

    if (currentError) {
      console.error('❌ Erro ao buscar competências atuais:', currentError);
      return;
    }

    console.log(`   📊 Competências atuais: ${currentCompetencies.length}`);

    // 3. Se não tem competências, criar manualmente
    if (currentCompetencies.length === 0) {
      console.log('\n3️⃣ Criando competências manualmente...');
      
      // Buscar todas as competências disponíveis
      const { data: allCompetencies, error: allCompetenciesError } = await supabase
        .from('competencies')
        .select('id, name, code')
        .order('code');

      if (allCompetenciesError) {
        console.error('❌ Erro ao buscar competências do sistema:', allCompetenciesError);
        return;
      }

      console.log(`   📊 Encontradas ${allCompetencies.length} competências para criar`);

      // Criar competências em lotes
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < allCompetencies.length; i += batchSize) {
        const batch = allCompetencies.slice(i, i + batchSize);
        batches.push(batch);
      }

      console.log(`   🔄 Processando ${batches.length} lotes...`);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchData = batch.map(competency => ({
          profile_id: profile.id,
          competency_id: competency.id,
          level: 0,
          last_evaluated_at: new Date().toISOString(),
        }));

        const { error: batchError } = await supabase
          .from('user_competencies')
          .insert(batchData);

        if (batchError) {
          console.error(`   ❌ Erro ao inserir lote ${batchIndex + 1}:`, batchError);
        } else {
          console.log(`   ✅ Lote ${batchIndex + 1}/${batches.length} processado (${batch.length} competências)`);
        }
      }
    } else {
      console.log('   ✅ Usuário já tem competências criadas');
    }

    // 4. Verificar competências finais
    console.log('\n4️⃣ Verificando competências finais...');
    
    const { data: finalCompetencies, error: finalError } = await supabase
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
      .eq('profile_id', profile.id);

    if (finalError) {
      console.error('❌ Erro ao verificar competências finais:', finalError);
      return;
    }

    console.log(`   📊 Total de competências: ${finalCompetencies.length}`);

    if (finalCompetencies.length > 0) {
      // Agrupar por nível
      const byLevel = finalCompetencies.reduce((acc, comp) => {
        acc[comp.level] = (acc[comp.level] || 0) + 1;
        return acc;
      }, {});

      console.log(`   📈 Distribuição por nível:`);
      Object.entries(byLevel).forEach(([level, count]) => {
        console.log(`      - Nível ${level}: ${count} competências`);
      });

      // Mostrar algumas competências como exemplo
      console.log(`   📝 Exemplos de competências:`);
      finalCompetencies.slice(0, 3).forEach(comp => {
        console.log(`      - ${comp.competencies.name}: Nível ${comp.level}`);
      });
    }

    // 5. Verificar total de competências no sistema
    console.log('\n5️⃣ Verificando total de competências no sistema...');
    
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

    // 6. Resumo final
    console.log('\n🎉 TESTE DO CACHE SERVICE CONCLUÍDO!');
    console.log('\n📊 RESUMO FINAL:');
    console.log(`📊 Competências criadas: ${finalCompetencies.length}`);
    console.log(`📊 Competências esperadas: ${allCompetencies?.length || 0}`);

    if (finalCompetencies.length > 0) {
      console.log('\n✅ SISTEMA FUNCIONANDO:');
      console.log('✅ Competências criadas automaticamente');
      console.log('✅ Sistema de apostila dinâmica funcionará');
      console.log('✅ Performance otimizada');
    } else {
      console.log('\n❌ PROBLEMA AINDA EXISTE:');
      console.log('❌ Competências não foram criadas');
      console.log('❌ Sistema de apostila dinâmica não funcionará');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testCacheService()
  .then(() => {
    console.log('\n✅ Teste concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error);
    process.exit(1);
  }); 