import { Request, Response } from 'express';
import { DynamicQuestionsService } from '../services/dynamic-questions.service';
import { UserCompetencyRepository } from '../repositories/user-competency.repository';
import { SparseCompetencyService } from '../services/sparse-competency.service';
import { StatisticsService } from '../services/statistics.service';

export class DynamicQuestionsController {
  private dynamicQuestionsService: DynamicQuestionsService;
  private sparseCompetencyService: SparseCompetencyService;
  private statisticsService: StatisticsService;

  constructor() {
    const userCompetencyRepository = new UserCompetencyRepository();
    this.dynamicQuestionsService = new DynamicQuestionsService(
      userCompetencyRepository
    );
    this.sparseCompetencyService = new SparseCompetencyService();
    this.statisticsService = new StatisticsService();
  }

  /**
   * GET /api/questions/dynamic
   * Busca questões dinâmicas baseadas no nível de competência do usuário
   */
  async getDynamicQuestions(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const maxQuestions = parseInt(req.query.maxQuestions as string) || 20;

      const questions = await this.dynamicQuestionsService.getDynamicQuestions({
        profileId,
        maxQuestions,
      });

      return res.json({
        success: true,
        data: questions,
      });
    } catch (error) {
      console.error('Erro ao buscar questões dinâmicas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /api/questions/answer
   * Submete resposta do usuário e atualiza nível de competência
   */
  async submitAnswer(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const { questionId, answer, isCorrect, competencyName, topicName } =
        req.body;

      if (
        !questionId ||
        answer === undefined ||
        isCorrect === undefined ||
        !competencyName
      ) {
        return res.status(400).json({
          success: false,
          message: 'Dados incompletos para submissão da resposta',
        });
      }

      // Salvar resposta do usuário
      await this.saveUserAnswer(
        profileId,
        questionId,
        answer,
        isCorrect,
        competencyName,
        topicName || competencyName
      );

      // Atualizar nível de competência
      await this.dynamicQuestionsService.updateCompetencyLevel(
        profileId,
        competencyName,
        isCorrect
      );

      return res.json({
        success: true,
        message: 'Resposta processada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * GET /api/competencies/user
   * Busca competências do usuário com níveis
   */
  async getUserCompetencies(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const userCompetencyRepository = new UserCompetencyRepository();
      const competencies = await userCompetencyRepository.findByProfileId(
        profileId
      );

      return res.json({
        success: true,
        data: competencies,
      });
    } catch (error) {
      console.error('Erro ao buscar competências do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * GET /api/questions/session
   * Busca sessão completa com competências e questões
   */
  async getSessionQuestions(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const maxQuestions = parseInt(req.query.maxQuestions as string) || 20;

      // Buscar competências do usuário
      const userCompetencies =
        await this.sparseCompetencyService.getAllUserCompetencies(profileId);

      // Buscar questões baseadas nas competências
      const questions = await this.dynamicQuestionsService.getDynamicQuestions({
        profileId,
        maxQuestions,
      });

      const sessionId = `session_${Date.now()}_${profileId}`;

      return res.json({
        msgCode: 'success',
        data: {
          userCompetencies,
          questions,
          sessionId,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar sessão de questões:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /api/questions/session/complete
   * Finaliza sessão e atualiza competências
   */
  async completeSession(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const { answers } = req.body;

      if (!Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: 'Respostas devem ser um array',
        });
      }

      // Processar cada resposta
      for (const answer of answers) {
        const {
          questionId,
          answer: selectedAnswer,
          isCorrect,
          competencyName,
          topicName,
        } = answer;

        // Salvar resposta do usuário
        await this.saveUserAnswer(
          profileId,
          questionId,
          selectedAnswer,
          isCorrect,
          competencyName,
          topicName
        );

        // Atualizar nível de competência
        await this.dynamicQuestionsService.updateCompetencyLevel(
          profileId,
          competencyName,
          isCorrect
        );
      }

      return res.json({
        msgCode: 'success',
        message: 'Sessão finalizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /api/questions/preload
   * Pré-carrega dados do usuário após login
   */
  async preloadUserData(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      // Buscar competências do usuário
      const userCompetencies =
        await this.sparseCompetencyService.getAllUserCompetencies(profileId);

      // Buscar algumas questões para cache
      const questions = await this.dynamicQuestionsService.getDynamicQuestions({
        profileId,
        maxQuestions: 10,
      });

      return res.json({
        msgCode: 'success',
        data: {
          userCompetencies,
          questions,
          preloadedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Erro no pré-carregamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * Salva resposta do usuário e registra estatísticas
   */
  private async saveUserAnswer(
    profileId: string,
    questionId: string,
    answer: string,
    isCorrect: boolean,
    competencyName?: string,
    topicName?: string
  ) {
    try {
      // Log da resposta
      console.log(
        `💾 Resposta salva: questão ${questionId}, correto: ${isCorrect}`
      );
      console.log(`📊 Dados da resposta:`, {
        profileId: profileId,
        questionId: questionId,
        answer: answer,
        isCorrect: isCorrect,
        competencyName: competencyName,
        topicName: topicName,
      });

      // Registrar estatísticas se tivermos as informações de competência
      if (competencyName && topicName) {
        await this.statisticsService.recordAnswer(profileId, {
          questionId,
          subtopicName: competencyName,
          topicName,
          isCorrect,
        });
        console.log(
          `📈 Estatísticas registradas para competência: ${competencyName}`
        );
      } else {
        console.log(
          `⚠️ Não foi possível registrar estatísticas - dados de competência ausentes`
        );
      }
    } catch (error) {
      console.error(
        '❌ Erro ao salvar resposta ou registrar estatísticas:',
        error
      );
      // Não vamos falhar o processo principal por erro nas estatísticas
    }
  }
}
