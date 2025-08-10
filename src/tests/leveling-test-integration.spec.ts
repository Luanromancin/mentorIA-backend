import { describe, it, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import env from '../env';
import { LevelingTestService } from '../services/leveling-test.service';

describe('Teste de Nivelamento - Integração Completa', () => {
  let supabase: any;
  let levelingTestService: LevelingTestService;
  const TEST_USER_EMAIL = 'nivelamento2@teste.com';
  let testUserId: string;

  beforeAll(async () => {
    // Configurar cliente Supabase
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    levelingTestService = new LevelingTestService();

    // Buscar ID do usuário de teste
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', TEST_USER_EMAIL)
      .single();

    if (!profile) {
      throw new Error(`Usuário de teste ${TEST_USER_EMAIL} não encontrado`);
    }

    testUserId = profile.id;
    console.log(`🧪 Usuário de teste: ${testUserId}`);
  });

  beforeEach(async () => {
    console.log('🧹 Limpando dados do usuário de teste...');

    // Resetar flag has_completed_leveling_test
    await supabase
      .from('profiles')
      .update({ has_completed_leveling_test: false })
      .eq('id', testUserId);

    // Deletar todas as sessões do usuário
    await supabase
      .from('leveling_test_sessions')
      .delete()
      .eq('profile_id', testUserId);

    // Deletar todas as competências do usuário
    await supabase
      .from('user_competencies')
      .delete()
      .eq('profile_id', testUserId);

    console.log('✅ Dados limpos');
  });

  afterAll(async () => {
    console.log('🧹 Limpeza final...');

    // Limpar dados do usuário de teste
    await supabase
      .from('leveling_test_sessions')
      .delete()
      .eq('profile_id', testUserId);

    await supabase
      .from('user_competencies')
      .delete()
      .eq('profile_id', testUserId);

    console.log('✅ Limpeza final concluída');
  });

  it('deve completar o teste de nivelamento e verificar competências', async () => {
    console.log('🚀 Iniciando teste de nivelamento...');

    // 1. Verificar se usuário não completou o teste
    const hasCompletedBefore =
      await levelingTestService.hasCompletedLevelingTest(testUserId);
    expect(hasCompletedBefore).toBe(false);
    console.log('✅ Usuário não completou o teste inicialmente');

    // 2. Iniciar teste de nivelamento
    const startResult = await levelingTestService.startTest(testUserId);
    expect(startResult.session).toBeDefined();
    expect(startResult.questions).toBeDefined();
    expect(startResult.questions.length).toBe(26);
    console.log(
      `✅ Teste iniciado com ${startResult.questions.length} questões`
    );

    // 3. Responder todas as questões com "b" (segunda opção)
    const sessionId = startResult.session.id;
    let currentQuestionIndex = 0;

    for (const question of startResult.questions) {
      console.log(
        `📝 Respondendo questão ${
          currentQuestionIndex + 1
        }/26: ${question.question.statement.substring(0, 50)}...`
      );

      const answerResult = await levelingTestService.answerQuestion({
        sessionId,
        questionId: question.question.id,
        selectedAnswer:
          question.question.options[1] || question.question.options[0], // "b" ou primeira opção se não houver "b"
      });

      expect(answerResult).toBeDefined();
      expect(answerResult.nextQuestionIndex).toBe(currentQuestionIndex + 1);

      currentQuestionIndex++;
    }

    console.log('✅ Todas as questões respondidas');

    // 4. Finalizar teste
    const completeResult = await levelingTestService.completeTest(sessionId);
    expect(completeResult).toBeDefined();
    expect(completeResult.sessionId).toBe(sessionId);
    expect(completeResult.totalQuestions).toBe(26);
    expect(completeResult.competencyResults).toBeDefined();
    expect(completeResult.competencyResults.length).toBe(26); // Uma competência por questão

    console.log(
      `✅ Teste finalizado: ${completeResult.correctAnswers}/${completeResult.totalQuestions} acertos`
    );

    // 5. Verificar se usuário completou o teste
    const hasCompletedAfter =
      await levelingTestService.hasCompletedLevelingTest(testUserId);
    expect(hasCompletedAfter).toBe(true);
    console.log('✅ Usuário marcado como tendo completado o teste');

    // 6. Verificar competências na base de dados
    const { data: userCompetencies, error } = await supabase
      .from('user_competencies')
      .select('competency_id, level')
      .eq('profile_id', testUserId);

    expect(error).toBeNull();
    expect(userCompetencies).toBeDefined();

    // Contar competências com nível 1 (acertos)
    const competenciesWithLevel1 = userCompetencies.filter(
      (uc: any) => uc.level === 1
    ).length;
    const competenciesWithLevel0 = userCompetencies.filter(
      (uc: any) => uc.level === 0
    ).length;

    console.log(`📊 Competências registradas: ${userCompetencies.length}`);
    console.log(`📊 Competências com nível 1: ${competenciesWithLevel1}`);
    console.log(`📊 Competências com nível 0: ${competenciesWithLevel0}`);

    // Verificar se a lógica está correta:
    // - Só devem ser registradas competências com nível 1 (acertos)
    // - Competências com nível 0 não devem aparecer na tabela
    expect(competenciesWithLevel0).toBe(0);
    expect(competenciesWithLevel1).toBeGreaterThan(0);
    expect(competenciesWithLevel1).toBeLessThanOrEqual(26);

    // 7. Verificar se o perfil foi marcado como completado
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_completed_leveling_test')
      .eq('id', testUserId)
      .single();

    expect(profile.has_completed_leveling_test).toBe(true);
    console.log(
      '✅ Perfil marcado como tendo completado o teste de nivelamento'
    );

    console.log('🎉 Teste de integração concluído com sucesso!');
  }, 60000); // Timeout de 60 segundos

  it('deve verificar que competências com nível 0 não são registradas', async () => {
    console.log('🔍 Testando lógica de competências com nível 0...');

    // 1. Iniciar teste
    const startResult = await levelingTestService.startTest(testUserId);
    const sessionId = startResult.session.id;

    // 2. Responder todas as questões com uma resposta que sabemos que está errada
    // (usar uma resposta que não existe nas opções)
    for (const question of startResult.questions) {
      await levelingTestService.answerQuestion({
        sessionId,
        questionId: question.question.id,
        selectedAnswer: 'RESPOSTA_INCORRETA_QUE_NAO_EXISTE',
      });
    }

    // 3. Finalizar teste
    await levelingTestService.completeTest(sessionId);

    // 4. Verificar que NENHUMA competência foi registrada (todas erradas = nível 0)
    const { data: userCompetencies } = await supabase
      .from('user_competencies')
      .select('competency_id, level')
      .eq('profile_id', testUserId);

    expect(userCompetencies.length).toBe(0);
    console.log('✅ Nenhuma competência registrada (todas erradas = nível 0)');
  }, 60000); // Timeout de 60 segundos
});
