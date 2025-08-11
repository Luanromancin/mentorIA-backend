const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTopicProgress() {
  console.log('🧪 Testando cálculo de progresso dos tópicos...\n');

  const userId = '8691e88d-c6d8-4011-822d-fb5db400035d';

  try {
    // 1. Testar função get_user_statistics atualizada
    console.log('📊 1. Testando get_user_statistics com topic_progress:');
    const { data: statsData, error: statsError } = await supabase.rpc('get_user_statistics', {
      user_profile_id: userId
    });

    if (statsError) {
      console.error('❌ Erro ao obter estatísticas:', statsError);
    } else {
      console.log('✅ Estatísticas com progresso dos tópicos:');
      
      if (statsData.by_topic) {
        statsData.by_topic.forEach((topic, index) => {
          console.log(`   ${index + 1}. ${topic.name}:`);
          console.log(`      - Questões: ${topic.questions_answered}`);
          console.log(`      - Acurácia: ${topic.accuracy}%`);
          console.log(`      - Progresso: ${topic.topic_progress}% (subtópicos dominados)`);
        });
      }
    }

    // 2. Verificar dados de competências para entender o cálculo
    console.log('\n📋 2. Verificando níveis de competências:');
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
      console.error('❌ Erro ao buscar competências:', compError);
    } else {
      console.log(`✅ Encontrados ${userComps.length} registros de competências:`);
      userComps.forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.competencies.name}: Nível ${comp.level}`);
      });
    }

    // 3. Verificar dados de estatísticas por tópico
    console.log('\n📈 3. Verificando dados de estatísticas por tópico:');
    const { data: topicStats, error: topicError } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .order('topic_name');

    if (topicError) {
      console.error('❌ Erro ao buscar estatísticas por tópico:', topicError);
    } else {
      console.log(`✅ Encontrados ${topicStats.length} registros de estatísticas:`);
      
      // Agrupar por tópico
      const topics = {};
      topicStats.forEach(stat => {
        if (!topics[stat.topic_name]) {
          topics[stat.topic_name] = [];
        }
        topics[stat.topic_name].push(stat);
      });

      Object.entries(topics).forEach(([topicName, stats]) => {
        console.log(`   📚 ${topicName}:`);
        stats.forEach(stat => {
          console.log(`      - ${stat.subtopic_name}: ${stat.correct_answers}/${stat.questions_answered} (${Math.round((stat.correct_answers/stat.questions_answered)*100)}%)`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testTopicProgress();
