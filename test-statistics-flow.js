const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testStatisticsFlow() {
  console.log('🧪 Testando fluxo de atualização das estatísticas...\n');

  const userId = '8691e88d-c6d8-4011-822d-fb5db400035d'; // Seu usuário de teste

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

    // 2. Verificar user_competencies iniciais
    console.log('\n📊 2. Verificando competências iniciais:');
    const { data: initialCompetencies, error: compError } = await supabase
      .from('user_competencies')
      .select('*')
      .eq('profile_id', userId);

    if (compError) {
      console.error('❌ Erro ao buscar competências:', compError);
    } else {
      console.log(`✅ Competências encontradas: ${initialCompetencies.length}`);
      initialCompetencies.forEach(comp => {
        console.log(`   - ${comp.competency_id}: Nível ${comp.level}`);
      });
    }

    // 3. Simular respostas de questões (primeiras 20)
    console.log('\n🎯 3. Simulando respostas das primeiras 20 questões:');
    
    // Simular algumas respostas corretas e incorretas
    const mockAnswers = [
      { questionId: 'q1', isCorrect: true, topicName: 'Álgebra', subtopicName: 'funções' },
      { questionId: 'q2', isCorrect: false, topicName: 'Álgebra', subtopicName: 'funções' },
      { questionId: 'q3', isCorrect: true, topicName: 'Geometria', subtopicName: 'triângulos' },
      { questionId: 'q4', isCorrect: true, topicName: 'Álgebra', subtopicName: 'sistemas' },
      { questionId: 'q5', isCorrect: false, topicName: 'Geometria', subtopicName: 'círculos' },
      // ... adicionar mais 15 questões para completar 20
    ];

    // Simular registro de respostas (isso seria feito pelo frontend)
    console.log('   📝 Registrando respostas...');
    for (let i = 0; i < 20; i++) {
      const answer = mockAnswers[i] || {
        questionId: `q${i + 1}`,
        isCorrect: Math.random() > 0.3, // 70% de acerto
        topicName: ['Álgebra', 'Geometria', 'Trigonometria'][Math.floor(Math.random() * 3)],
        subtopicName: ['funções', 'sistemas', 'triângulos', 'círculos'][Math.floor(Math.random() * 4)]
      };

      // Aqui você simularia a chamada da API que o frontend faria
      console.log(`   - Questão ${i + 1}: ${answer.isCorrect ? '✅' : '❌'} (${answer.topicName} - ${answer.subtopicName})`);
    }

    // 4. Simular registro de estudo diário (20 questões)
    console.log('\n📊 4. Registrando estudo diário (20 questões):');
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

    // 5. Verificar estatísticas após primeira sessão
    console.log('\n📊 5. Verificando estatísticas após primeira sessão:');
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

    // 6. Simular mais 20 questões (segunda sessão)
    console.log('\n🎯 6. Simulando mais 20 questões (segunda sessão):');
    
    for (let i = 20; i < 40; i++) {
      const answer = {
        questionId: `q${i + 1}`,
        isCorrect: Math.random() > 0.3,
        topicName: ['Álgebra', 'Geometria', 'Trigonometria'][Math.floor(Math.random() * 3)],
        subtopicName: ['funções', 'sistemas', 'triângulos', 'círculos'][Math.floor(Math.random() * 4)]
      };
      console.log(`   - Questão ${i + 1}: ${answer.isCorrect ? '✅' : '❌'} (${answer.topicName} - ${answer.subtopicName})`);
    }

    // 7. Registrar segunda sessão
    console.log('\n📊 7. Registrando segunda sessão (mais 20 questões):');
    const { data: studyResult2, error: studyError2 } = await supabase
      .rpc('register_daily_study', {
        user_profile_id: userId,
        questions_count: 20
      });

    if (studyError2) {
      console.error('❌ Erro ao registrar segunda sessão:', studyError2);
    } else {
      console.log('✅ Segunda sessão registrada:', studyResult2);
    }

    // 8. Verificar estatísticas finais
    console.log('\n📊 8. Verificando estatísticas finais (40 questões):');
    const { data: finalStats, error: finalError } = await supabase
      .rpc('get_user_statistics', { user_profile_id: userId });

    if (finalError) {
      console.error('❌ Erro ao buscar estatísticas finais:', finalError);
    } else {
      console.log('✅ Estatísticas finais:');
      console.log(`   - Questões respondidas: ${finalStats.general.total_questions}`);
      console.log(`   - Questões corretas: ${finalStats.general.total_correct}`);
      console.log(`   - Acurácia geral: ${finalStats.general.overall_accuracy}%`);
      console.log(`   - Sequência de estudos: ${finalStats.general.study_streak}`);
      console.log(`   - Testes completados: ${finalStats.general.completed_tests}`);
    }

    // 9. Comparar mudanças
    console.log('\n📊 9. Resumo das mudanças:');
    console.log(`   - Questões respondidas: ${initialStats.general.total_questions} → ${finalStats.general.total_questions} (+${finalStats.general.total_questions - initialStats.general.total_questions})`);
    console.log(`   - Questões corretas: ${initialStats.general.total_correct} → ${finalStats.general.total_correct} (+${finalStats.general.total_correct - initialStats.general.total_correct})`);
    console.log(`   - Acurácia: ${initialStats.general.overall_accuracy}% → ${finalStats.general.overall_accuracy}%`);
    console.log(`   - Sequência: ${initialStats.general.study_streak} → ${finalStats.general.study_streak}`);
    console.log(`   - Testes: ${initialStats.general.completed_tests} → ${finalStats.general.completed_tests} (+${finalStats.general.completed_tests - initialStats.general.completed_tests})`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testStatisticsFlow();
