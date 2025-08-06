import { UserAnswerRepository } from '../repositories/user-answer.repository';
import { UserCompetencyRepository } from '../repositories/user-competency.repository';

export interface UserStatistics {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  studyStreak: number;
  totalStudyTime: number;
  completedTests: number;
  averageScore: number;
  topicsProgress: {
    topic: string;
    subtopics: {
      name: string;
      progress: number;
      questionsAnswered: number;
      correctAnswers: number;
    }[];
    totalProgress: number;
    totalQuestions: number;
  }[];
  recentActivity: {
    date: string;
    questionsAnswered: number;
    accuracy: number;
  }[];
}

export class StatisticsService {
  constructor(
    private userAnswerRepository: UserAnswerRepository,
    private userCompetencyRepository: UserCompetencyRepository
  ) {}

  /**
   * Busca estatísticas completas do usuário
   */
  async getUserStatistics(profileId: string): Promise<UserStatistics> {
    try {
      console.log(`📊 Buscando estatísticas para usuário ${profileId}`);

      // Buscar estatísticas básicas
      const basicStats = await this.userAnswerRepository.getUserStatistics(
        profileId
      );

      // Buscar estatísticas por tópico
      const topicStats = await this.userAnswerRepository.getStatisticsByTopic(
        profileId
      );

      // Buscar atividade recente
      const recentActivity = await this.userAnswerRepository.getRecentActivity(
        profileId,
        7
      );

      // Converter para formato esperado pelo frontend
      const topicsProgress = topicStats.map((topic) => ({
        topic: topic.topic,
        subtopics: topic.subtopics.map((subtopic) => ({
          name: subtopic.name,
          progress: subtopic.accuracy,
          questionsAnswered: subtopic.totalQuestions,
          correctAnswers: subtopic.correctAnswers,
        })),
        totalProgress: topic.accuracy,
        totalQuestions: topic.totalQuestions,
      }));

      // Calcular tempo total de estudo (aproximação)
      const totalStudyTime = Math.floor(
        (basicStats.averageTimePerQuestion * basicStats.totalQuestions) / 60
      ); // em minutos

      const statistics: UserStatistics = {
        totalQuestions: basicStats.totalQuestions,
        correctAnswers: basicStats.correctAnswers,
        accuracy: basicStats.accuracy,
        studyStreak: basicStats.studyStreak,
        totalStudyTime,
        completedTests: basicStats.completedTests,
        averageScore: basicStats.accuracy,
        topicsProgress,
        recentActivity,
      };

      console.log(
        `✅ Estatísticas carregadas: ${statistics.totalQuestions} questões, ${statistics.accuracy}% de precisão`
      );
      return statistics;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /**
   * Salva uma resposta do usuário e atualiza estatísticas
   */
  async saveUserAnswer(data: {
    profileId: string;
    questionId: string;
    selectedAlternativeId?: string;
    isCorrect: boolean;
    timeSpentSeconds?: number;
  }): Promise<void> {
    try {
      console.log(
        `💾 Salvando resposta: questão ${data.questionId}, correto: ${data.isCorrect}`
      );

      const result = await this.userAnswerRepository.create({
        profileId: data.profileId,
        questionId: data.questionId,
        selectedAlternativeId: data.selectedAlternativeId,
        isCorrect: data.isCorrect,
        timeSpentSeconds: data.timeSpentSeconds,
      });

      console.log('✅ Resposta salva com sucesso:', result);
    } catch (error) {
      console.error('❌ Erro ao salvar resposta:', error);
      throw error;
    }
  }

  /**
   * Busca estatísticas de competências do usuário
   */
  async getUserCompetencyStatistics(profileId: string): Promise<{
    totalCompetencies: number;
    masteredCompetencies: number;
    inProgressCompetencies: number;
    beginnerCompetencies: number;
    averageLevel: number;
  }> {
    try {
      const userCompetencies =
        await this.userCompetencyRepository.findByProfileId(profileId);

      const totalCompetencies = userCompetencies.length;
      const masteredCompetencies = userCompetencies.filter(
        (comp) => comp.level === 3
      ).length;
      const inProgressCompetencies = userCompetencies.filter(
        (comp) => comp.level === 1 || comp.level === 2
      ).length;
      const beginnerCompetencies = userCompetencies.filter(
        (comp) => comp.level === 0
      ).length;

      const averageLevel =
        totalCompetencies > 0
          ? userCompetencies.reduce((sum, comp) => sum + comp.level, 0) /
            totalCompetencies
          : 0;

      return {
        totalCompetencies,
        masteredCompetencies,
        inProgressCompetencies,
        beginnerCompetencies,
        averageLevel: Math.round(averageLevel * 100) / 100,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de competências:', error);
      throw error;
    }
  }

  /**
   * Busca progresso detalhado por competência
   */
  async getCompetencyProgress(profileId: string): Promise<
    {
      competencyName: string;
      level: number;
      totalQuestions: number;
      correctAnswers: number;
      accuracy: number;
    }[]
  > {
    try {
      const userCompetencies =
        await this.userCompetencyRepository.findByProfileId(profileId);
      const userAnswers = await this.userAnswerRepository.findByProfileId(
        profileId
      );

      // Agrupar respostas por competência
      const competencyStats = new Map<
        string,
        {
          totalQuestions: number;
          correctAnswers: number;
        }
      >();

      for (const answer of userAnswers) {
        if (answer.question?.subtopicName) {
          const competencyName = answer.question.subtopicName;

          if (!competencyStats.has(competencyName)) {
            competencyStats.set(competencyName, {
              totalQuestions: 0,
              correctAnswers: 0,
            });
          }

          const stats = competencyStats.get(competencyName)!;
          stats.totalQuestions++;
          if (answer.isCorrect) {
            stats.correctAnswers++;
          }
        }
      }

      // Combinar dados de competências com estatísticas
      return userCompetencies.map((competency) => {
        const stats = competencyStats.get(
          competency.competency?.name || ''
        ) || {
          totalQuestions: 0,
          correctAnswers: 0,
        };

        return {
          competencyName: competency.competency?.name || 'Desconhecida',
          level: competency.level,
          totalQuestions: stats.totalQuestions,
          correctAnswers: stats.correctAnswers,
          accuracy:
            stats.totalQuestions > 0
              ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
              : 0,
        };
      });
    } catch (error) {
      console.error('❌ Erro ao buscar progresso de competências:', error);
      throw error;
    }
  }
}
