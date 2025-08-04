import { createClient } from '@supabase/supabase-js';
import env from '../env';

interface UserStatistics {
  general: {
    total_questions: number;
    total_correct: number;
    overall_accuracy: number;
  };
  by_topic: Array<{
    topic_name: string;
    questions_answered: number;
    correct_answers: number;
    accuracy_percentage: number;
  }>;
  by_competency: Array<{
    subtopic_name: string;
    questions_answered: number;
    correct_answers: number;
    accuracy_percentage: number;
  }>;
}

interface QuestionAnswer {
  questionId: string;
  subtopicName: string;
  topicName: string;
  isCorrect: boolean;
}

export class StatisticsService {
  private supabase;

  constructor() {
    // Verificar se as variáveis de ambiente estão definidas
    if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórios para o StatisticsService'
      );
    }

    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }

  /**
   * Registra uma resposta do usuário e atualiza as estatísticas
   */
  async recordAnswer(userId: string, answer: QuestionAnswer): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('upsert_user_statistics', {
        p_user_id: userId,
        p_subtopic_name: answer.subtopicName,
        p_topic_name: answer.topicName,
        p_is_correct: answer.isCorrect,
      });

      if (error) {
        throw new Error(`Erro ao registrar resposta: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao registrar estatística:', error);
      throw error;
    }
  }

  /**
   * Obtém as estatísticas completas do usuário
   */
  async getUserStatistics(userId: string): Promise<UserStatistics> {
    try {
      const { data, error } = await this.supabase.rpc('get_user_statistics', {
        p_user_id: userId,
      });

      if (error) {
        throw new Error(`Erro ao obter estatísticas: ${error.message}`);
      }

      // Se não há dados, retorna estrutura vazia
      if (!data) {
        return {
          general: {
            total_questions: 0,
            total_correct: 0,
            overall_accuracy: 0,
          },
          by_topic: [],
          by_competency: [],
        };
      }

      return data as UserStatistics;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas por competência específica
   */
  async getCompetencyStatistics(
    userId: string,
    subtopicName: string
  ): Promise<{
    questions_answered: number;
    correct_answers: number;
    accuracy_percentage: number;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_statistics')
        .select('questions_answered, correct_answers')
        .eq('user_id', userId)
        .eq('subtopic_name', subtopicName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado
          return null;
        }
        throw new Error(
          `Erro ao obter estatísticas da competência: ${error.message}`
        );
      }

      const accuracy =
        data.questions_answered > 0
          ? Math.round(
              (data.correct_answers / data.questions_answered) * 100 * 100
            ) / 100
          : 0;

      return {
        questions_answered: data.questions_answered,
        correct_answers: data.correct_answers,
        accuracy_percentage: accuracy,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas da competência:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas por tópico específico
   */
  async getTopicStatistics(
    userId: string,
    topicName: string
  ): Promise<{
    questions_answered: number;
    correct_answers: number;
    accuracy_percentage: number;
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_statistics')
        .select('questions_answered, correct_answers')
        .eq('user_id', userId)
        .eq('topic_name', topicName);

      if (error) {
        throw new Error(
          `Erro ao obter estatísticas do tópico: ${error.message}`
        );
      }

      if (!data || data.length === 0) {
        return null;
      }

      const totalQuestions = data.reduce(
        (sum, row) => sum + row.questions_answered,
        0
      );
      const totalCorrect = data.reduce(
        (sum, row) => sum + row.correct_answers,
        0
      );
      const accuracy =
        totalQuestions > 0
          ? Math.round((totalCorrect / totalQuestions) * 100 * 100) / 100
          : 0;

      return {
        questions_answered: totalQuestions,
        correct_answers: totalCorrect,
        accuracy_percentage: accuracy,
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do tópico:', error);
      throw error;
    }
  }

  /**
   * Obtém ranking de competências do usuário (ordenadas por acurácia)
   */
  async getCompetencyRanking(userId: string): Promise<
    Array<{
      subtopic_name: string;
      questions_answered: number;
      correct_answers: number;
      accuracy_percentage: number;
    }>
  > {
    try {
      const { data, error } = await this.supabase
        .from('user_statistics')
        .select('subtopic_name, questions_answered, correct_answers')
        .eq('user_id', userId)
        .order('correct_answers', { ascending: false });

      if (error) {
        throw new Error(
          `Erro ao obter ranking de competências: ${error.message}`
        );
      }

      return data.map((row) => ({
        subtopic_name: row.subtopic_name,
        questions_answered: row.questions_answered,
        correct_answers: row.correct_answers,
        accuracy_percentage:
          row.questions_answered > 0
            ? Math.round(
                (row.correct_answers / row.questions_answered) * 100 * 100
              ) / 100
            : 0,
      }));
    } catch (error) {
      console.error('Erro ao obter ranking de competências:', error);
      throw error;
    }
  }

  /**
   * Obtém competências que precisam de mais atenção (baixa acurácia)
   */
  async getWeakCompetencies(
    userId: string,
    threshold: number = 70
  ): Promise<
    Array<{
      subtopic_name: string;
      questions_answered: number;
      correct_answers: number;
      accuracy_percentage: number;
    }>
  > {
    try {
      const statistics = await this.getUserStatistics(userId);

      return statistics.by_competency
        .filter((comp) => comp.accuracy_percentage < threshold)
        .sort((a, b) => a.accuracy_percentage - b.accuracy_percentage);
    } catch (error) {
      console.error('Erro ao obter competências fracas:', error);
      throw error;
    }
  }
}
