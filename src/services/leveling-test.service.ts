import { LevelingTestRepository } from '../repositories/leveling-test.repository';
import { LevelingTestQuestionWithDetails } from '../entities/leveling-test-question.entity';
import { 
  AnswerLevelingTestDto, 
  LevelingTestQuestionDto,
  LevelingTestSessionDto,
  LevelingTestResultDto,
  CompetencyResultDto
} from '../dtos/leveling-test.dto';

export class LevelingTestService {
  private repository: LevelingTestRepository;

  constructor() {
    this.repository = new LevelingTestRepository();
  }

  // Iniciar teste de nivelamento
  async startTest(profileId: string): Promise<{
    session: LevelingTestSessionDto;
    questions: LevelingTestQuestionDto[];
  }> {
    // Verificar se já existe uma sessão ativa
    let session = await this.repository.getActiveSession(profileId);
    
    if (!session) {
      // Criar nova sessão
      session = await this.repository.createSession(profileId);
    }

    // Buscar questões do teste
    const questions = await this.repository.getLevelingTestQuestions();

    return {
      session: {
        id: session.id,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: questions.length,
        isCompleted: session.isCompleted,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },
      questions: questions
        .filter(q => q.question) // Filtrar apenas questões com detalhes
        .map(q => ({
          id: q.id,
          orderIndex: q.orderIndex,
          question: {
            id: q.question!.id,
            statement: q.question!.statement,
            options: q.question!.options,
          },
        })),
    };
  }

  // Responder questão
  async answerQuestion(data: AnswerLevelingTestDto): Promise<{
    isCorrect: boolean;
    nextQuestionIndex: number;
    totalQuestions: number;
  }> {
    const { sessionId, questionId, selectedAnswer } = data;

    // Buscar sessão
    const session = await this.repository.getSession(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    if (session.isCompleted) {
      throw new Error('Teste já foi finalizado');
    }

    // Buscar questão para verificar resposta correta
    const questions = await this.repository.getLevelingTestQuestions();
    const question = questions.find(q => q.questionId === questionId);
    
    if (!question || !question.question) {
      throw new Error('Questão não encontrada');
    }

    const isCorrect = selectedAnswer === question.question.correctAnswer;

    // Atualizar sessão com a resposta
    await this.repository.updateSessionWithAnswer(sessionId, questionId, selectedAnswer, isCorrect);

    return {
      isCorrect,
      nextQuestionIndex: session.currentQuestionIndex + 1,
      totalQuestions: questions.length,
    };
  }

  // Finalizar teste
  async completeTest(sessionId: string): Promise<LevelingTestResultDto> {
    // Buscar sessão
    const session = await this.repository.getSession(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    if (session.isCompleted) {
      throw new Error('Teste já foi finalizado');
    }

    // Buscar questões para calcular resultados
    const questions = await this.repository.getLevelingTestQuestions();
    
    // Calcular resultados por competência
    const competencyResults = await this.calculateCompetencyResults(session.answers, questions);
    
    // Calcular estatísticas gerais
    const totalQuestions = questions.length;
    const correctAnswers = session.answers.filter(a => a.isCorrect).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Marcar sessão como completada
    await this.repository.completeSession(sessionId);

    // Marcar perfil como tendo completado o teste
    await this.repository.markProfileAsCompleted(session.profileId);

    // Atualizar competências do usuário baseado nos resultados
    await this.updateUserCompetencies(session.profileId, competencyResults);

    return {
      sessionId,
      totalQuestions,
      correctAnswers,
      accuracy,
      completedAt: new Date(),
      competencyResults,
    };
  }

  // Buscar progresso do teste
  async getProgress(sessionId: string): Promise<{
    session: LevelingTestSessionDto;
    currentQuestion: LevelingTestQuestionDto | null;
    answeredQuestions: number;
    totalQuestions: number;
  }> {
    // Buscar sessão
    const session = await this.repository.getSession(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    // Buscar questões
    const questions = await this.repository.getLevelingTestQuestions();
    
    // Buscar questão atual
    const currentQuestion = questions.find(q => q.orderIndex === session.currentQuestionIndex);
    
    return {
      session: {
        id: session.id,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: questions.length,
        isCompleted: session.isCompleted,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      },
      currentQuestion: currentQuestion && currentQuestion.question ? {
        id: currentQuestion.id,
        orderIndex: currentQuestion.orderIndex,
        question: {
          id: currentQuestion.question.id,
          statement: currentQuestion.question.statement,
          options: currentQuestion.question.options,
        },
      } : null,
      answeredQuestions: session.answers.length,
      totalQuestions: questions.length,
    };
  }

  // Verificar se usuário completou o teste de nivelamento
  async hasCompletedLevelingTest(profileId: string): Promise<boolean> {
    // Primeiro verificar se há uma sessão ativa completada
    const activeSession = await this.repository.getActiveSession(profileId);
    if (activeSession && activeSession.isCompleted) {
      return true;
    }

    // Se não há sessão ativa, verificar se há alguma sessão completada
    // Buscar qualquer sessão completada para este usuário
    const { data: completedSessions, error } = await this.repository.supabaseClient
      .from('leveling_test_sessions')
      .select('id, is_completed')
      .eq('profile_id', profileId)
      .eq('is_completed', true)
      .limit(1);

    if (error) {
      console.error('Erro ao verificar sessões completadas:', error);
      return false;
    }

    return completedSessions && completedSessions.length > 0;
  }

  // Atualizar competências do usuário baseado nos resultados do teste
  private async updateUserCompetencies(profileId: string, competencyResults: CompetencyResultDto[]): Promise<void> {
    console.log(`🔄 Atualizando competências para usuário ${profileId}:`, competencyResults);
    
    for (const result of competencyResults) {
      // Só registrar se acertou (accuracy = 100%)
      if (result.accuracy === 100) {
        console.log(`📊 Competência ${result.competencyName} (${result.competencyId}): Acertou -> Nível 1`);
        
        // Registrar competência com nível 1 (só se acertou)
        const { error } = await this.repository.supabaseClient
          .from('user_competencies')
          .upsert({
            profile_id: profileId,
            competency_id: result.competencyId,
            level: 1, // Sempre nível 1 quando acerta
            last_evaluated_at: new Date().toISOString(),
          });

        if (error) {
          console.error(`❌ Erro ao atualizar competência ${result.competencyId}:`, error);
        } else {
          console.log(`✅ Competência ${result.competencyName} registrada com nível 1`);
        }
      } else {
        // Se errou, não registra nada (mantém nível 0 implicitamente)
        console.log(`📊 Competência ${result.competencyName} (${result.competencyId}): Errou -> Mantém nível 0 (não registra)`);
      }
    }
  }

  // Calcular resultados por competência
  private async calculateCompetencyResults(
    answers: any[], 
    questions: LevelingTestQuestionWithDetails[]
  ): Promise<CompetencyResultDto[]> {
    const results: CompetencyResultDto[] = [];

    // Para cada resposta, buscar o subtopic da questão e mapear para competência
    for (const answer of answers) {
      const question = questions.find(q => q.questionId === answer.questionId);
      if (question && question.question) {
        // Buscar subtopic da questão original
        const originalQuestion = await this.getQuestionDetails(question.questionId);
        if (originalQuestion && originalQuestion.subtopic_name) {
          // Buscar competência que corresponde ao subtopic
          const competency = await this.findCompetencyBySubtopic(originalQuestion.subtopic_name);
          
          if (competency) {
            // Criar resultado para esta competência
            const result: CompetencyResultDto = {
              competencyId: competency.id,
              competencyName: competency.name,
              questionsAnswered: 1, // Sempre 1 questão por competência
              correctAnswers: answer.isCorrect ? 1 : 0,
              accuracy: answer.isCorrect ? 100 : 0, // 100% se acertou, 0% se errou
            };
            
            results.push(result);
          } else {
            console.warn(`⚠️ Competência não encontrada para subtopic: ${originalQuestion.subtopic_name}`);
          }
        } else {
          console.warn(`⚠️ Questão ${question.questionId} não tem subtopic_name`);
        }
      }
    }

    return results;
  }

  // Método para buscar competência por subtopic
  private async findCompetencyBySubtopic(subtopicName: string): Promise<any> {
    const { data, error } = await this.repository.supabaseClient
      .from('competencies')
      .select('id, name, description')
      .eq('name', subtopicName)
      .single();

    if (error) {
      console.error(`Erro ao buscar competência para subtopic ${subtopicName}:`, error);
      return null;
    }

    return data;
  }

  // Método auxiliar para buscar detalhes da questão
  private async getQuestionDetails(questionId: string): Promise<any> {
    const { data, error } = await this.repository.supabaseClient
      .from('questions')
      .select('topic_name, subtopic_name')
      .eq('id', questionId)
      .single();

    if (error) {
      console.error(`Erro ao buscar detalhes da questão ${questionId}:`, error);
      return null;
    }

    return data;
  }
}
