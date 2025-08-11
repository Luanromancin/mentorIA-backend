import { createClient } from '@supabase/supabase-js';
import env from '../env';

interface UserStatistics {
  general: {
    total_questions: number;
    total_correct: number;
    overall_accuracy: number;
    study_streak: number;
    completed_tests: number;
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

    // Usar a chave de serviço se disponível, senão usar a anônima
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

    console.log(
      '🔧 StatisticsService: Usando chave de serviço:',
      !!env.SUPABASE_SERVICE_ROLE_KEY
    );

    this.supabase = createClient(env.SUPABASE_URL, supabaseKey);
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
        user_profile_id: userId,
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
            study_streak: 0,
            completed_tests: 0,
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
   * Obtém competências que precisam de mais atenção
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
      const { data, error } = await this.supabase
        .from('user_statistics')
        .select('subtopic_name, questions_answered, correct_answers')
        .eq('user_id', userId)
        .order('accuracy_percentage', { ascending: true });

      if (error) {
        throw new Error(`Erro ao obter competências fracas: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      return data
        .map((row) => {
          const accuracy =
            row.questions_answered > 0
              ? Math.round(
                  (row.correct_answers / row.questions_answered) * 100 * 100
                ) / 100
              : 0;

          return {
            subtopic_name: row.subtopic_name,
            questions_answered: row.questions_answered,
            correct_answers: row.correct_answers,
            accuracy_percentage: accuracy,
          };
        })
        .filter((comp) => comp.accuracy_percentage < threshold)
        .sort((a, b) => a.accuracy_percentage - b.accuracy_percentage);
    } catch (error) {
      console.error('Erro ao obter competências fracas:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os tópicos e subtópicos disponíveis na tabela questions
   */
  async getAvailableTopics(): Promise<{ [topicName: string]: string[] }> {
    try {
      // Usar a função que está funcionando
      const { data, error } = await this.supabase.rpc(
        'get_available_topics_simple'
      );

      if (error) {
        throw new Error(`Erro ao obter tópicos disponíveis: ${error.message}`);
      }

      console.log('🔍 Debug - Tipo de data:', typeof data);
      console.log('🔍 Debug - É array?', Array.isArray(data));
      console.log(
        '🔍 Debug - É objeto?',
        typeof data === 'object' && data !== null
      );
      console.log(
        '🔍 Debug - Data:',
        JSON.stringify(data, null, 2).substring(0, 500) + '...'
      );

      if (!data) {
        return {};
      }

      // Lidar com diferentes formatos de retorno
      let topicsData: { [topicName: string]: string[] };

      if (
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].get_available_topics_simple
      ) {
        // Formato: [{ "get_available_topics_simple": { "topic1": ["sub1", "sub2"], ... } }]
        topicsData = data[0].get_available_topics_simple;
      } else if (data.topics) {
        // Formato: { "topics": { "topic1": ["sub1", "sub2"], ... } }
        topicsData = data.topics;
      } else if (typeof data === 'object' && !Array.isArray(data)) {
        // Formato: { "topic1": ["sub1", "sub2"], ... }
        topicsData = data;
      } else {
        console.error('❌ Formato de dados inesperado:', data);
        return {};
      }

      console.log(
        '✅ Tópicos carregados com sucesso:',
        Object.keys(topicsData).length
      );
      return topicsData;
    } catch (error) {
      console.error('Erro ao obter tópicos disponíveis:', error);
      throw error;
    }
  }

  /**
   * Registra estudo diário e atualiza sequência
   */
  async registerDailyStudy(
    userId: string,
    questionsCount: number = 0
  ): Promise<{
    current_streak: number;
    questions_completed: number;
    completed_daily_goal: boolean;
    date: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('register_daily_study', {
        user_profile_id: userId,
        questions_count: questionsCount,
      });

      if (error) {
        throw new Error(`Erro ao registrar estudo diário: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro ao registrar estudo diário:', error);
      throw error;
    }
  }

  /**
   * Obtém sequência atual de estudos
   */
  async getCurrentStudyStreak(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_user_study_streak', {
        user_profile_id: userId,
      });

      if (error) {
        throw new Error(`Erro ao obter sequência de estudos: ${error.message}`);
      }

      return data || 0;
    } catch (error) {
      console.error('Erro ao obter sequência de estudos:', error);
      return 0;
    }
  }
}
