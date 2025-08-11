const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserCompetencies() {
  console.log('🔍 Verificando dados na tabela user_competencies...\n');

  const userId = '8691e88d-c6d8-4011-822d-fb5db400035d';

  try {
    // 1. Verificar se existem dados na user_competencies
    console.log('📊 1. Dados na tabela user_competencies:');
    const { data: userComps, error: compError } = await supabase
      .from('user_competencies')
      .select(`
        *,
        competencies:competency_id (
          id,
          name
        )
      `)
      .eq('profile_id', userId);

    if (compError) {
      console.error('❌ Erro ao buscar user_competencies:', compError);
    } else {
      console.log(`✅ Encontrados ${userComps.length} registros na user_competencies:`);
      if (userComps.length === 0) {
        console.log('   ⚠️  Nenhum registro encontrado - todos os níveis são 0 (implícito)');
      } else {
        userComps.forEach((comp, index) => {
          console.log(`   ${index + 1}. ${comp.competencies.name}: Nível ${comp.level}`);
        });
      }
    }

    // 2. Verificar todas as competências disponíveis
    console.log('\n📋 2. Todas as competências disponíveis:');
    const { data: allComps, error: allCompsError } = await supabase
      .from('competencies')
      .select('id, name')
      .order('name');

    if (allCompsError) {
      console.error('❌ Erro ao buscar competências:', allCompsError);
    } else {
      console.log(`✅ Total de ${allComps.length} competências no sistema:`);
      allComps.forEach((comp, index) => {
        const userComp = userComps?.find(uc => uc.competency_id === comp.id);
        const level = userComp ? userComp.level : 0;
        console.log(`   ${index + 1}. ${comp.name}: Nível ${level} ${userComp ? '(definido)' : '(implícito)'}`);
      });
    }

    // 3. Verificar a função SQL atual
    console.log('\n🎯 3. Testando função get_user_statistics:');
    const { data: functionResult, error: functionError } = await supabase.rpc('get_user_statistics', {
      user_profile_id: userId
    });

    if (functionError) {
      console.error('❌ Erro na função SQL:', functionError);
    } else {
      console.log('✅ Níveis retornados pela função:');
      if (functionResult.by_competency) {
        functionResult.by_competency.forEach((comp, index) => {
          console.log(`   ${index + 1}. ${comp.name}: Nível ${comp.mastery_level} (${comp.accuracy}%)`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkUserCompetencies();
