const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRegisterDailyStudy() {
  console.log('🧪 Testando registro de estudo diário...\n');

  const userId = '8691e88d-c6d8-4011-822d-fb5db400035d';

  try {
    // 1. Testar registro com 20 questões (objetivo diário completo)
    console.log('📊 1. Testando registro com 20 questões (objetivo completo):');
    const { data: result1, error: error1 } = await supabase.rpc('register_daily_study', {
      user_profile_id: userId,
      questions_count: 20
    });

    if (error1) {
      console.error('❌ Erro ao registrar estudo com 20 questões:', error1);
    } else {
      console.log('✅ Resultado do registro com 20 questões:');
      console.log('   - Sequência atual:', result1.current_streak);
      console.log('   - Questões completadas:', result1.questions_completed);
      console.log('   - Objetivo diário completo:', result1.completed_daily_goal);
      console.log('   - Data:', result1.date);
    }

    // 2. Testar registro com 15 questões (objetivo diário incompleto)
    console.log('\n📊 2. Testando registro com 15 questões (objetivo incompleto):');
    const { data: result2, error: error2 } = await supabase.rpc('register_daily_study', {
      user_profile_id: userId,
      questions_count: 15
    });

    if (error2) {
      console.error('❌ Erro ao registrar estudo com 15 questões:', error2);
    } else {
      console.log('✅ Resultado do registro com 15 questões:');
      console.log('   - Sequência atual:', result2.current_streak);
      console.log('   - Questões completadas:', result2.questions_completed);
      console.log('   - Objetivo diário completo:', result2.completed_daily_goal);
      console.log('   - Data:', result2.date);
    }

    // 3. Verificar dados na tabela user_study_streaks
    console.log('\n📋 3. Verificando dados na tabela user_study_streaks:');
    const { data: streaks, error: streaksError } = await supabase
      .from('user_study_streaks')
      .select('*')
      .eq('profile_id', userId)
      .order('study_date', { ascending: false })
      .limit(5);

    if (streaksError) {
      console.error('❌ Erro ao buscar dados de sequência:', streaksError);
    } else {
      console.log(`✅ Encontrados ${streaks.length} registros de sequência:`);
      streaks.forEach((streak, index) => {
        console.log(`   ${index + 1}. ${streak.study_date}: ${streak.questions_completed} questões, objetivo: ${streak.completed_daily_goal}`);
      });
    }

    // 4. Testar função get_user_study_streak
    console.log('\n📊 4. Testando função get_user_study_streak:');
    const { data: currentStreak, error: streakError } = await supabase.rpc('get_user_study_streak', {
      user_profile_id: userId
    });

    if (streakError) {
      console.error('❌ Erro ao obter sequência atual:', streakError);
    } else {
      console.log('✅ Sequência atual de estudos:', currentStreak);
    }

    // 5. Testar get_user_statistics atualizado
    console.log('\n📊 5. Testando get_user_statistics com dados de sequência:');
    const { data: stats, error: statsError } = await supabase.rpc('get_user_statistics', {
      user_profile_id: userId
    });

    if (statsError) {
      console.error('❌ Erro ao obter estatísticas:', statsError);
    } else {
      console.log('✅ Estatísticas atualizadas:');
      console.log('   - Sequência de estudos:', stats.general.study_streak);
      console.log('   - Testes completados:', stats.general.completed_tests);
      console.log('   - Total de questões:', stats.general.total_questions);
      console.log('   - Acurácia geral:', stats.general.overall_accuracy + '%');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testRegisterDailyStudy();
