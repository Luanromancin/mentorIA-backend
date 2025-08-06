import { Request, Response } from 'express';
import { DynamicQuestionsService } from '../services/dynamic-questions.service';
import { UserCompetencyRepository } from '../repositories/user-competency.repository';
import { SparseCompetencyService } from '../services/sparse-competency.service';

export class DynamicQuestionsController {
  private dynamicQuestionsService: DynamicQuestionsService;
  private sparseCompetencyService: SparseCompetencyService;

  constructor() {
    const userCompetencyRepository = new UserCompetencyRepository();
    this.dynamicQuestionsService = new DynamicQuestionsService(
      userCompetencyRepository
    );
    this.sparseCompetencyService = new SparseCompetencyService();
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

      const { questionId, answer, isCorrect, competencyName } = req.body;

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
      await this.saveUserAnswer(profileId, questionId, answer, isCorrect);

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
        } = answer;

        // Salvar resposta do usuário
        await this.saveUserAnswer(
          profileId,
          questionId,
          selectedAnswer,
          isCorrect
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
   * Salva resposta do usuário na tabela user_answers
   */
  private async saveUserAnswer(
    profileId: string,
    questionId: string,
    answer: string,
    isCorrect: boolean
  ) {
    try {
      // Importar o repository dinamicamente para evitar dependência circular
      const { UserAnswerRepository } = await import(
        '../repositories/user-answer.repository'
      );
      const userAnswerRepository = new UserAnswerRepository();

      await userAnswerRepository.create({
        profileId,
        questionId,
        selectedAlternativeId: answer,
        isCorrect,
        timeSpentSeconds: undefined, // TODO: Implementar tracking de tempo
      });

      console.log(
        `💾 Resposta salva no banco: questão ${questionId}, correto: ${isCorrect}`
      );
    } catch (error) {
      console.error('❌ Erro ao salvar resposta no banco:', error);
      // Não falhar o fluxo se o salvamento falhar
      console.log('⚠️ Salvamento falhou, mas continuando o fluxo...');
    }
  }
}
