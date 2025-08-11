const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLevelingStatus() {
  console.log('🧪 Testando status do teste de nivelamento...\n');

  const userId = '8691e88d-c6d8-4011-822d-fb5db400035d';

  try {
    // 1. Verificar sessões de leveling test
    console.log('📋 1. Verificando sessões de leveling test:');
    const { data: sessions, error: sessionsError } = await supabase
      .from('leveling_test_sessions')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      console.error('❌ Erro ao buscar sessões:', sessionsError);
    } else {
      console.log(`✅ Encontradas ${sessions.length} sessões:`);
      sessions.forEach((session, index) => {
        console.log(`   ${index + 1}. Sessão ${session.id}:`);
        console.log(`      - Criada em: ${session.created_at}`);
        console.log(`      - Completada: ${session.is_completed}`);
        console.log(`      - Questões respondidas: ${session.answered_questions_count || 0}`);
        console.log(`      - Total de questões: ${session.total_questions || 0}`);
      });
    }

    // 2. Verificar se há sessões completadas
    console.log('\n📊 2. Verificando sessões completadas:');
    const { data: completedSessions, error: completedError } = await supabase
      .from('leveling_test_sessions')
      .select('id, is_completed, created_at')
      .eq('profile_id', userId)
      .eq('is_completed', true)
      .limit(1);

    if (completedError) {
      console.error('❌ Erro ao buscar sessões completadas:', completedError);
    } else {
      console.log(`✅ Sessões completadas: ${completedSessions.length}`);
      if (completedSessions.length > 0) {
        console.log('   - Status: ✅ Usuário completou o teste de nivelamento');
      } else {
        console.log('   - Status: ❌ Usuário NÃO completou o teste de nivelamento');
      }
    }

    // 3. Verificar sessão ativa
    console.log('\n📊 3. Verificando sessão ativa:');
    const { data: activeSession, error: activeError } = await supabase
      .from('leveling_test_sessions')
      .select('*')
      .eq('profile_id', userId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (activeError) {
      console.error('❌ Erro ao buscar sessão ativa:', activeError);
    } else {
      if (activeSession && activeSession.length > 0) {
        console.log('✅ Sessão ativa encontrada:');
        console.log(`   - ID: ${activeSession[0].id}`);
        console.log(`   - Completada: ${activeSession[0].is_completed}`);
        console.log(`   - Questões respondidas: ${activeSession[0].answered_questions_count || 0}`);
      } else {
        console.log('ℹ️ Nenhuma sessão ativa encontrada');
      }
    }

    // 4. Simular a lógica do service
    console.log('\n📊 4. Simulando lógica do service:');
    const hasCompleted = completedSessions && completedSessions.length > 0;
    console.log(`   - hasCompletedLevelingTest: ${hasCompleted}`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testLevelingStatus();
