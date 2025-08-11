const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRealStatisticsFlow() {
  console.log('🧪 Testando fluxo REAL de atualização das estatísticas...\n');

  const userId = '8691e88d-c6d8-4011-822d-fb5db400035d';

  try {
    // 1. Verificar estatísticas iniciais
    console.log('📊 1. Verificando estatísticas iniciais:');
    const { data: initialStats, error: statsError } = await supabase
      .rpc('get_user_statistics', { user_profile_id: userId });

    if (statsError) {
      console.error('❌ Erro ao buscar estatísticas:', statsError);
      return;
    }

    console.log('✅ Estatísticas iniciais:');
    console.log(`   - Questões respondidas: ${initialStats.general.total_questions}`);
    console.log(`   - Questões corretas: ${initialStats.general.total_correct}`);
    console.log(`   - Acurácia geral: ${initialStats.general.overall_accuracy}%`);
    console.log(`   - Sequência de estudos: ${initialStats.general.study_streak}`);
    console.log(`   - Testes completados: ${initialStats.general.completed_tests}`);

    // 2. Simular registro de respostas individuais (primeiras 20 questões)
    console.log('\n🎯 2. Registrando respostas individuais (primeiras 20 questões):');
    
    const mockAnswers = [
      { questionId: 'q1', isCorrect: true, topicName: 'Álgebra', subtopicName: 'funções' },
      { questionId: 'q2', isCorrect: false, topicName: 'Álgebra', subtopicName: 'funções' },
      { questionId: 'q3', isCorrect: true, topicName: 'Geometria', subtopicName: 'triângulos' },
      { questionId: 'q4', isCorrect: true, topicName: 'Álgebra', subtopicName: 'sistemas' },
      { questionId: 'q5', isCorrect: false, topicName: 'Geometria', subtopicName: 'círculos' },
      { questionId: 'q6', isCorrect: true, topicName: 'Trigonometria', subtopicName: 'funções' },
      { questionId: 'q7', isCorrect: true, topicName: 'Álgebra', subtopicName: 'sistemas' },
      { questionId: 'q8', isCorrect: false, topicName: 'Geometria', subtopicName: 'triângulos' },
      { questionId: 'q9', isCorrect: true, topicName: 'Trigonometria', subtopicName: 'círculos' },
      { questionId: 'q10', isCorrect: true, topicName: 'Álgebra', subtopicName: 'funções' },
      { questionId: 'q11', isCorrect: false, topicName: 'Geometria', subtopicName: 'sistemas' },
      { questionId: 'q12', isCorrect: true, topicName: 'Trigonometria', subtopicName: 'triângulos' },
      { questionId: 'q13', isCorrect: true, topicName: 'Álgebra', subtopicName: 'círculos' },
      { questionId: 'q14', isCorrect: false, topicName: 'Geometria', subtopicName: 'funções' },
      { questionId: 'q15', isCorrect: true, topicName: 'Trigonometria', subtopicName: 'sistemas' },
      { questionId: 'q16', isCorrect: true, topicName: 'Álgebra', subtopicName: 'triângulos' },
      { questionId: 'q17', isCorrect: false, topicName: 'Geometria', subtopicName: 'círculos' },
      { questionId: 'q18', isCorrect: true, topicName: 'Trigonometria', subtopicName: 'funções' },
      { questionId: 'q19', isCorrect: true, topicName: 'Álgebra', subtopicName: 'sistemas' },
      { questionId: 'q20', isCorrect: true, topicName: 'Geometria', subtopicName: 'triângulos' }
    ];

    // Simular registro de cada resposta (como o frontend faria)
    console.log('   📝 Registrando cada resposta individual...');
    for (let i = 0; i < 20; i++) {
      const answer = mockAnswers[i];
      console.log(`   - Questão ${i + 1}: ${answer.isCorrect ? '✅' : '❌'} (${answer.topicName} - ${answer.subtopicName})`);
      
      // Aqui você simularia a chamada da API /statistics/record-answer
      // Por enquanto, vamos apenas simular
    }

    // 3. Registrar estudo diário (20 questões)
    console.log('\n📊 3. Registrando estudo diário (20 questões):');
    const { data: studyResult, error: studyError } = await supabase
      .rpc('register_daily_study', {
        user_profile_id: userId,
        questions_count: 20
      });

    if (studyError) {
      console.error('❌ Erro ao registrar estudo diário:', studyError);
    } else {
      console.log('✅ Estudo diário registrado:', studyResult);
    }

    // 4. Verificar estatísticas após primeira sessão
    console.log('\n📊 4. Verificando estatísticas após primeira sessão:');
    const { data: statsAfter20, error: statsAfterError } = await supabase
      .rpc('get_user_statistics', { user_profile_id: userId });

    if (statsAfterError) {
      console.error('❌ Erro ao buscar estatísticas:', statsAfterError);
    } else {
      console.log('✅ Estatísticas após 20 questões:');
      console.log(`   - Questões respondidas: ${statsAfter20.general.total_questions}`);
      console.log(`   - Questões corretas: ${statsAfter20.general.total_correct}`);
      console.log(`   - Acurácia geral: ${statsAfter20.general.overall_accuracy}%`);
      console.log(`   - Sequência de estudos: ${statsAfter20.general.study_streak}`);
      console.log(`   - Testes completados: ${statsAfter20.general.completed_tests}`);
    }

    // 5. Comparar mudanças
    console.log('\n📊 5. Resumo das mudanças:');
    console.log(`   - Questões respondidas: ${initialStats.general.total_questions} → ${statsAfter20.general.total_questions} (+${statsAfter20.general.total_questions - initialStats.general.total_questions})`);
    console.log(`   - Questões corretas: ${initialStats.general.total_correct} → ${statsAfter20.general.total_correct} (+${statsAfter20.general.total_correct - initialStats.general.total_correct})`);
    console.log(`   - Acurácia: ${initialStats.general.overall_accuracy}% → ${statsAfter20.general.overall_accuracy}%`);
    console.log(`   - Sequência: ${initialStats.general.study_streak} → ${statsAfter20.general.study_streak}`);
    console.log(`   - Testes: ${initialStats.general.completed_tests} → ${statsAfter20.general.completed_tests} (+${statsAfter20.general.completed_tests - initialStats.general.completed_tests})`);

    // 6. Explicar o que está acontecendo
    console.log('\n🔍 6. Análise do comportamento:');
    console.log('   📝 O que está funcionando:');
    console.log('      ✅ Sequência de estudos (atualizada pelo register_daily_study)');
    console.log('      ✅ Testes completados (atualizado pelo register_daily_study)');
    console.log('   📝 O que NÃO está funcionando:');
    console.log('      ❌ Questões respondidas (precisa do registro individual)');
    console.log('      ❌ Questões corretas (precisa do registro individual)');
    console.log('      ❌ Acurácia geral (calculada a partir das questões)');
    console.log('\n   💡 Para que funcione completamente, o frontend precisa:');
    console.log('      1. Registrar cada resposta individual via /statistics/record-answer');
    console.log('      2. Chamar register_daily_study ao final da sessão');
    console.log('      3. As estatísticas serão atualizadas automaticamente');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testRealStatisticsFlow();
