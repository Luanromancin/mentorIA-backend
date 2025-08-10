import { createClient } from '@supabase/supabase-js';
import { LevelingTestQuestionWithDetails } from '../entities/leveling-test-question.entity';
import { LevelingTestSession, LevelingTestAnswer } from '../entities/leveling-test-session.entity';
import env from '../env';

export class LevelingTestRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  // Getter para acessar o supabase (usado pelo service)
  get supabaseClient() {
    return this.supabase;
  }

  // Buscar todas as questões do teste de nivelamento ordenadas
  async getLevelingTestQuestions(): Promise<LevelingTestQuestionWithDetails[]> {
    // Primeiro buscar as questões do teste de nivelamento
    const { data: levelingQuestions, error: levelingError } = await this.supabase
      .from('leveling_test_questions')
      .select('*')
      .order('order_index', { ascending: true });

    if (levelingError) {
      throw new Error(`Erro ao buscar questões do teste de nivelamento: ${levelingError.message}`);
    }

    if (!levelingQuestions || levelingQuestions.length === 0) {
      return [];
    }

    // Buscar os detalhes das questões
    const questionIds = levelingQuestions.map(q => q.question_id);
    const { data: questionsDetails, error: detailsError } = await this.supabase
      .from('questions')
      .select('*')
      .in('id', questionIds);

    if (detailsError) {
      throw new Error(`Erro ao buscar detalhes das questões: ${detailsError.message}`);
    }

    // Buscar as alternativas para todas as questões
    const { data: alternatives, error: alternativesError } = await this.supabase
      .from('alternatives')
      .select('*')
      .in('question_id', questionIds);

    if (alternativesError) {
      throw new Error(`Erro ao buscar alternativas: ${alternativesError.message}`);
    }

    // Criar mapas para facilitar o lookup
    const questionsMap = new Map();
    if (questionsDetails) {
      questionsDetails.forEach(q => questionsMap.set(q.id, q));
    }

    const alternativesMap = new Map();
    if (alternatives) {
      alternatives.forEach(alt => {
        if (!alternativesMap.has(alt.question_id)) {
          alternativesMap.set(alt.question_id, []);
        }
        alternativesMap.get(alt.question_id).push(alt);
      });
    }

    // Combinar os dados
    return levelingQuestions.map(item => {
      const questionDetails = questionsMap.get(item.question_id);
      const questionAlternatives = alternativesMap.get(item.question_id) || [];
      
      return {
        id: item.id,
        questionId: item.question_id,
        orderIndex: item.order_index,
        createdAt: item.created_at,
        question: questionDetails ? {
          id: questionDetails.id,
          statement: questionDetails.problem_statement || questionDetails.title,
          options: questionAlternatives.map((alt: any) => alt.text),
          correctAnswer: questionAlternatives.find((alt: any) => alt.is_correct)?.text || '',
        } : undefined,
      };
    });
  }

  // Criar nova sessão de teste
  async createSession(profileId: string): Promise<LevelingTestSession> {
    const sessionData = {
      id: `session_${Date.now()}_${profileId}`,
      profile_id: profileId,
      current_question_index: 0,
      answers: [],
      is_completed: false,
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from('leveling_test_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar sessão de teste: ${error.message}`);
    }

    return {
      id: data.id,
      profileId: data.profile_id,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || [],
      isCompleted: data.is_completed,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Buscar sessão por ID
  async getSession(sessionId: string): Promise<LevelingTestSession | null> {
    const { data, error } = await this.supabase
      .from('leveling_test_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Sessão não encontrada
      }
      throw new Error(`Erro ao buscar sessão: ${error.message}`);
    }

    return {
      id: data.id,
      profileId: data.profile_id,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || [],
      isCompleted: data.is_completed,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Buscar sessão ativa do usuário
  async getActiveSession(profileId: string): Promise<LevelingTestSession | null> {
    const { data, error } = await this.supabase
      .from('leveling_test_sessions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Nenhuma sessão ativa encontrada
      }
      throw new Error(`Erro ao buscar sessão ativa: ${error.message}`);
    }

    return {
      id: data.id,
      profileId: data.profile_id,
      currentQuestionIndex: data.current_question_index,
      answers: data.answers || [],
      isCompleted: data.is_completed,
      startedAt: new Date(data.started_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Atualizar sessão com resposta
  async updateSessionWithAnswer(
    sessionId: string, 
    questionId: string, 
    selectedAnswer: string, 
    isCorrect: boolean
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    const newAnswer: LevelingTestAnswer = {
      questionId,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date(),
    };

    const updatedAnswers = [...session.answers, newAnswer];
    const nextQuestionIndex = session.currentQuestionIndex + 1;

    const { error } = await this.supabase
      .from('leveling_test_sessions')
      .update({
        current_question_index: nextQuestionIndex,
        answers: updatedAnswers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Erro ao atualizar sessão: ${error.message}`);
    }
  }

  // Finalizar sessão
  async completeSession(sessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('leveling_test_sessions')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Erro ao finalizar sessão: ${error.message}`);
    }
  }

  // Marcar perfil como tendo completado o teste
  async markProfileAsCompleted(profileId: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({
        has_completed_leveling_test: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId);

    if (error) {
      throw new Error(`Erro ao marcar perfil como completado: ${error.message}`);
    }
  }
}
