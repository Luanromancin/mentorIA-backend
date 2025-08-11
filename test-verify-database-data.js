const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Usar as mesmas variáveis que o backend usa
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function verifyDatabaseData() {
  console.log('🔍 Verificando dados no banco de dados...\n');

  const userId = '8691e88d-c6d8-4011-822d-fb5db400035d';

  try {
    // 1. Verificar dados na tabela user_statistics
    console.log('📊 1. Dados na tabela user_statistics:');
    const { data: userStats, error: statsError } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId);

    if (statsError) {
      console.error('❌ Erro ao buscar user_statistics:', statsError);
    } else {
      console.log(`✅ Encontrados ${userStats.length} registros:`);
      userStats.forEach((stat, index) => {
        console.log(`   ${index + 1}. ${stat.topic_name} > ${stat.subtopic_name}: ${stat.correct_answers}/${stat.questions_answered} (${Math.round((stat.correct_answers/stat.questions_answered)*100)}%)`);
      });
    }

    console.log('\n📈 2. Testando função SQL get_user_statistics:');
    const { data: functionResult, error: functionError } = await supabase.rpc('get_user_statistics', {
      user_profile_id: userId
    });

    if (functionError) {
      console.error('❌ Erro na função SQL:', functionError);
    } else {
      console.log('✅ Função SQL retornou dados:');
      console.log('   - Total questões:', functionResult.general.total_questions);
      console.log('   - Total corretas:', functionResult.general.total_correct);
      console.log('   - Acurácia geral:', functionResult.general.overall_accuracy + '%');
      console.log('   - Tópicos:', functionResult.by_topic.length);
      console.log('   - Competências:', functionResult.by_competency.length);
    }

    console.log('\n🎯 3. Verificando dados específicos:');
    if (functionResult && functionResult.by_competency) {
      console.log('   Competências com dados:');
      functionResult.by_competency.forEach((comp, index) => {
        console.log(`   ${index + 1}. ${comp.name}: ${comp.correct_answers}/${comp.questions_answered} (${comp.accuracy}%) - Nível: ${comp.mastery_level}`);
      });
    }

    console.log('\n📋 4. Comparando com dados esperados:');
    const expectedData = {
      'Funções do 1º grau': { questions: 10, correct: 8, accuracy: 80 },
      'Sistemas de Equações': { questions: 8, correct: 6, accuracy: 75 },
      'Média Aritmética': { questions: 12, correct: 10, accuracy: 83.33 },
      'Mediana': { questions: 6, correct: 4, accuracy: 66.67 },
      'Moda': { questions: 4, correct: 3, accuracy: 75 },
      'Áreas': { questions: 15, correct: 12, accuracy: 80 },
      'Triângulos': { questions: 9, correct: 7, accuracy: 77.78 },
      'Cálculo de porcentagem': { questions: 20, correct: 18, accuracy: 90 },
      'Variação Percentual': { questions: 7, correct: 5, accuracy: 71.43 }
    };

    if (functionResult && functionResult.by_competency) {
      functionResult.by_competency.forEach(comp => {
        const expected = expectedData[comp.name];
        if (expected) {
          const matches = 
            comp.questions_answered === expected.questions &&
            comp.correct_answers === expected.correct &&
            Math.abs(comp.accuracy - expected.accuracy) < 1;
          
          console.log(`   ${comp.name}: ${matches ? '✅' : '❌'} (DB: ${comp.correct_answers}/${comp.questions_answered} ${comp.accuracy}% vs Esperado: ${expected.correct}/${expected.questions} ${expected.accuracy}%)`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verifyDatabaseData();
