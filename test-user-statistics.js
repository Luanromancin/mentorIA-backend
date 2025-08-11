const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserStatistics() {
  console.log('🧪 Testando API de estatísticas do usuário...\n');

  try {
    // Usar o user_id que vimos nos logs
    const userId = '8691e88d-c6d8-4011-822d-fb5db400035d';

    // 1. Verificar se o usuário tem estatísticas
    console.log('1. Verificando estatísticas do usuário...');
    const { data: userStats, error: userStatsError } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId);

    if (userStatsError) {
      console.error('❌ Erro ao buscar estatísticas do usuário:', userStatsError);
      return;
    }

    console.log('✅ Estatísticas do usuário encontradas:', userStats.length, 'registros');

    if (userStats.length > 0) {
      console.log('📋 Primeiros 3 registros:');
      userStats.slice(0, 3).forEach((stat, index) => {
        console.log(`   ${index + 1}. ${stat.topic_name} > ${stat.subtopic_name}: ${stat.questions_answered} questões, ${stat.correct_answers} corretas`);
      });
    } else {
      console.log('ℹ️ Usuário não tem estatísticas registradas ainda');
    }

    // 2. Testar a função getUserStatistics
    console.log('\n2. Testando função getUserStatistics...');
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_user_statistics', { p_user_id: userId });

    if (functionError) {
      console.error('❌ Erro na função getUserStatistics:', functionError);
      return;
    }

    console.log('✅ Função getUserStatistics funcionou!');
    console.log('📊 Dados retornados:', JSON.stringify(functionData, null, 2).substring(0, 1000) + '...');

    // 3. Verificar estrutura dos dados
    if (functionData) {
      console.log('\n3. Estrutura dos dados:');
      console.log('   - general:', functionData.general ? '✅' : '❌');
      console.log('   - by_topic:', functionData.by_topic ? `${functionData.by_topic.length} tópicos` : '❌');
      console.log('   - by_competency:', functionData.by_competency ? `${functionData.by_competency.length} competências` : '❌');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testUserStatistics();
