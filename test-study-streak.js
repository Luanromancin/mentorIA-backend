const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testStudyStreak() {
  console.log('🧪 Testando funcionalidade de sequência de estudos...\n');

  const userId = '8691e88d-c6d8-4011-822d-fb5db400035d';

  try {
    // 1. Testar função get_user_study_streak
    console.log('📊 1. Testando get_user_study_streak:');
    const { data: streakData, error: streakError } = await supabase.rpc('get_user_study_streak', {
      user_profile_id: userId
    });

    if (streakError) {
      console.error('❌ Erro ao obter sequência:', streakError);
    } else {
      console.log(`✅ Sequência atual: ${streakData} dias`);
    }

    // 2. Testar função register_daily_study
    console.log('\n📝 2. Testando register_daily_study (15 questões):');
    const { data: registerData, error: registerError } = await supabase.rpc('register_daily_study', {
      user_profile_id: userId,
      questions_count: 15
    });

    if (registerError) {
      console.error('❌ Erro ao registrar estudo:', registerError);
    } else {
      console.log('✅ Estudo registrado:', registerData);
    }

    // 3. Testar register_daily_study com 20 questões (completa meta)
    console.log('\n🎯 3. Testando register_daily_study (20 questões - meta completa):');
    const { data: completeData, error: completeError } = await supabase.rpc('register_daily_study', {
      user_profile_id: userId,
      questions_count: 20
    });

    if (completeError) {
      console.error('❌ Erro ao registrar estudo completo:', completeError);
    } else {
      console.log('✅ Estudo completo registrado:', completeData);
    }

    // 4. Verificar dados na tabela
    console.log('\n📋 4. Dados na tabela user_study_streaks:');
    const { data: tableData, error: tableError } = await supabase
      .from('user_study_streaks')
      .select('*')
      .eq('profile_id', userId)
      .order('study_date', { ascending: false });

    if (tableError) {
      console.error('❌ Erro ao buscar dados da tabela:', tableError);
    } else {
      console.log(`✅ Encontrados ${tableData.length} registros:`);
      tableData.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.study_date}: ${record.questions_completed} questões (meta: ${record.completed_daily_goal ? '✅' : '❌'})`);
      });
    }

    // 5. Testar função get_user_statistics atualizada
    console.log('\n📈 5. Testando get_user_statistics atualizada:');
    const { data: statsData, error: statsError } = await supabase.rpc('get_user_statistics', {
      user_profile_id: userId
    });

    if (statsError) {
      console.error('❌ Erro ao obter estatísticas:', statsError);
    } else {
      console.log('✅ Estatísticas atualizadas:');
      console.log(`   - Sequência de estudos: ${statsData.general.study_streak} dias`);
      console.log(`   - Testes completados: ${statsData.general.completed_tests}`);
      console.log(`   - Total questões: ${statsData.general.total_questions}`);
      console.log(`   - Acurácia geral: ${statsData.general.overall_accuracy}%`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testStudyStreak();
