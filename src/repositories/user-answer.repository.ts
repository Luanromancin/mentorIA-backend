import {
  UserAnswer,
  CreateUserAnswerDto,
  UserAnswerWithDetails,
} from '../entities/user-answer.entity';
import { createClient } from '@supabase/supabase-js';
import env from '../env';

export class UserAnswerRepository {
  private client;

  constructor() {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios'
      );
    }
    this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  /**
   * Cria uma nova resposta do usuário
   */
  async create(data: CreateUserAnswerDto): Promise<UserAnswer> {
    try {
      const { data: result, error } = await this.client
        .from('user_answers')
        .insert({
          profile_id: data.profileId,
          question_id: data.questionId,
          selected_alternative_id: data.selectedAlternativeId,
          is_correct: data.isCorrect,
          time_spent_seconds: data.timeSpentSeconds,
          answered_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar resposta do usuário:', error);
        throw error;
      }

      return this.mapToEntity(result);
    } catch (error) {
      console.error('Erro ao salvar resposta do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca todas as respostas de um usuário
   */
  async findByProfileId(profileId: string): Promise<UserAnswerWithDetails[]> {
    try {
      const { data, error } = await this.client
        .from('user_answers')
        .select(
          `
                    *,
                    questions!inner (
                        id,
                        title,
                        topic_name,
                        subtopic_name
                    ),
                    alternatives!inner (
                        id,
                        letter,
                        text
                    )
                `
        )
        .eq('profile_id', profileId)
        .order('answered_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar respostas do usuário:', error);
        throw error;
      }

      return (data || []).map((row) => this.mapToEntityWithDetails(row));
    } catch (error) {
      console.error('Erro ao buscar respostas do usuário:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas de respostas por tópico
   */
  async getStatisticsByTopic(profileId: string): Promise<
    {
      topic: string;
      totalQuestions: number;
      correctAnswers: number;
      accuracy: number;
      subtopics: {
        name: string;
        totalQuestions: number;
        correctAnswers: number;
        accuracy: number;
      }[];
    }[]
  > {
    try {
      const { data, error } = await this.client
        .from('user_answers')
        .select(
          `
                    is_correct,
                    questions!inner (
                        topic_name,
                        subtopic_name
                    )
                `
        )
        .eq('profile_id', profileId);

      if (error) {
        console.error('Erro ao buscar estatísticas por tópico:', error);
        throw error;
      }

      // Agrupar por tópico
      const topicStats = new Map<
        string,
        {
          topic: string;
          totalQuestions: number;
          correctAnswers: number;
          subtopics: Map<
            string,
            {
              name: string;
              totalQuestions: number;
              correctAnswers: number;
            }
          >;
        }
      >();

      for (const row of data || []) {
        const topic = (row.questions as any)?.topic_name || 'Sem tópico';
        const subtopic =
          (row.questions as any)?.subtopic_name || 'Sem subtópico';

        if (!topicStats.has(topic)) {
          topicStats.set(topic, {
            topic,
            totalQuestions: 0,
            correctAnswers: 0,
            subtopics: new Map(),
          });
        }

        const topicData = topicStats.get(topic)!;
        topicData.totalQuestions++;
        if (row.is_correct) {
          topicData.correctAnswers++;
        }

        if (!topicData.subtopics.has(subtopic)) {
          topicData.subtopics.set(subtopic, {
            name: subtopic,
            totalQuestions: 0,
            correctAnswers: 0,
          });
        }

        const subtopicData = topicData.subtopics.get(subtopic)!;
        subtopicData.totalQuestions++;
        if (row.is_correct) {
          subtopicData.correctAnswers++;
        }
      }

      // Converter para array e calcular acurácia
      return Array.from(topicStats.values()).map((topic) => ({
        topic: topic.topic,
        totalQuestions: topic.totalQuestions,
        correctAnswers: topic.correctAnswers,
        accuracy:
          topic.totalQuestions > 0
            ? (topic.correctAnswers / topic.totalQuestions) * 100
            : 0,
        subtopics: Array.from(topic.subtopics.values()).map((subtopic) => ({
          name: subtopic.name,
          totalQuestions: subtopic.totalQuestions,
          correctAnswers: subtopic.correctAnswers,
          accuracy:
            subtopic.totalQuestions > 0
              ? (subtopic.correctAnswers / subtopic.totalQuestions) * 100
              : 0,
        })),
      }));
    } catch (error) {
      console.error('Erro ao buscar estatísticas por tópico:', error);
      throw error;
    }
  }

  /**
   * Busca atividade recente do usuário
   */
  async getRecentActivity(
    profileId: string,
    days: number = 7
  ): Promise<
    {
      date: string;
      questionsAnswered: number;
      correctAnswers: number;
      accuracy: number;
    }[]
  > {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.client
        .from('user_answers')
        .select('is_correct, answered_at')
        .eq('profile_id', profileId)
        .gte('answered_at', startDate.toISOString())
        .lte('answered_at', endDate.toISOString())
        .order('answered_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar atividade recente:', error);
        throw error;
      }

      // Agrupar por data
      const dailyStats = new Map<
        string,
        {
          questionsAnswered: number;
          correctAnswers: number;
        }
      >();

      for (const row of data || []) {
        const date = new Date(row.answered_at).toISOString().split('T')[0];

        if (!dailyStats.has(date)) {
          dailyStats.set(date, {
            questionsAnswered: 0,
            correctAnswers: 0,
          });
        }

        const dayStats = dailyStats.get(date)!;
        dayStats.questionsAnswered++;
        if (row.is_correct) {
          dayStats.correctAnswers++;
        }
      }

      return Array.from(dailyStats.entries()).map(([date, stats]) => ({
        date,
        questionsAnswered: stats.questionsAnswered,
        correctAnswers: stats.correctAnswers,
        accuracy:
          stats.questionsAnswered > 0
            ? (stats.correctAnswers / stats.questionsAnswered) * 100
            : 0,
      }));
    } catch (error) {
      console.error('Erro ao buscar atividade recente:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas gerais do usuário
   */
  async getUserStatistics(profileId: string): Promise<{
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageTimePerQuestion: number;
    studyStreak: number;
    completedTests: number;
  }> {
    try {
      // Estatísticas básicas
      const { data: basicData, error: basicError } = await this.client
        .from('user_answers')
        .select('is_correct, time_spent_seconds')
        .eq('profile_id', profileId);

      if (basicError) {
        console.error('Erro ao buscar estatísticas básicas:', basicError);
        throw basicError;
      }

      const totalQuestions = basicData?.length || 0;
      const correctAnswers =
        basicData?.filter((row) => row.is_correct).length || 0;
      const accuracy =
        totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      // Tempo médio por questão
      const timeData = basicData?.filter((row) => row.time_spent_seconds) || [];
      const averageTimePerQuestion =
        timeData.length > 0
          ? timeData.reduce(
              (sum, row) => sum + (row.time_spent_seconds || 0),
              0
            ) / timeData.length
          : 0;

      // Streak de estudo (dias consecutivos)
      const { data: streakData, error: streakError } = await this.client
        .from('user_answers')
        .select('answered_at')
        .eq('profile_id', profileId)
        .order('answered_at', { ascending: false });

      if (streakError) {
        console.error('Erro ao buscar dados de streak:', streakError);
        throw streakError;
      }

      let studyStreak = 0;
      if (streakData && streakData.length > 0) {
        const uniqueDates = new Set(
          streakData.map(
            (row) => new Date(row.answered_at).toISOString().split('T')[0]
          )
        );
        const sortedDates = Array.from(uniqueDates).sort().reverse();

        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        for (const date of sortedDates) {
          if (date === today || date === yesterdayStr) {
            currentStreak++;
          } else {
            break;
          }
        }
        studyStreak = currentStreak;
      }

      // Número de sessões completadas (aproximação)
      const { data: sessionsData, error: sessionsError } = await this.client
        .from('user_answers')
        .select('answered_at')
        .eq('profile_id', profileId)
        .order('answered_at', { ascending: true });

      if (sessionsError) {
        console.error('Erro ao buscar dados de sessões:', sessionsError);
        throw sessionsError;
      }

      let completedTests = 0;
      if (sessionsData && sessionsData.length > 0) {
        // Contar sessões baseado em intervalos de tempo (aproximação)
        const sessionThreshold = 30 * 60 * 1000; // 30 minutos
        let lastAnswerTime = new Date(sessionsData[0].answered_at).getTime();
        let sessionCount = 1;

        for (let i = 1; i < sessionsData.length; i++) {
          const currentAnswerTime = new Date(
            sessionsData[i].answered_at
          ).getTime();
          if (currentAnswerTime - lastAnswerTime > sessionThreshold) {
            sessionCount++;
          }
          lastAnswerTime = currentAnswerTime;
        }
        completedTests = sessionCount;
      }

      return {
        totalQuestions,
        correctAnswers,
        accuracy,
        averageTimePerQuestion,
        studyStreak,
        completedTests,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      throw error;
    }
  }

  private mapToEntity(row: any): UserAnswer {
    return {
      id: row.id,
      profileId: row.profile_id,
      questionId: row.question_id,
      selectedAlternativeId: row.selected_alternative_id,
      isCorrect: row.is_correct,
      answeredAt: row.answered_at ? new Date(row.answered_at) : undefined,
      timeSpentSeconds: row.time_spent_seconds,
    };
  }

  private mapToEntityWithDetails(row: any): UserAnswerWithDetails {
    return {
      ...this.mapToEntity(row),
      question: row.questions
        ? {
            id: row.questions.id,
            title: row.questions.title,
            topicName: row.questions.topic_name,
            subtopicName: row.questions.subtopic_name,
          }
        : undefined,
      selectedAlternative: row.alternatives
        ? {
            id: row.alternatives.id,
            letter: row.alternatives.letter,
            text: row.alternatives.text,
          }
        : undefined,
    };
  }
}
