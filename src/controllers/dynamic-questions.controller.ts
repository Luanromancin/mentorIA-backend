import { Request, Response } from 'express';
import { DynamicQuestionsService } from '../services/dynamic-questions.service';
import { UserCompetencyRepository } from '../repositories/user-competency.repository';

export class DynamicQuestionsController {
  private dynamicQuestionsService: DynamicQuestionsService;

  constructor() {
    const userCompetencyRepository = new UserCompetencyRepository();
    this.dynamicQuestionsService = new DynamicQuestionsService(
      userCompetencyRepository
    );
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
   * Salva resposta do usuário na tabela user_answers
   */
  private async saveUserAnswer(
    profileId: string,
    questionId: string,
    answer: string,
    isCorrect: boolean
  ) {
    // Por enquanto, vamos apenas logar a resposta
    // TODO: Implementar salvamento real quando tivermos acesso ao banco
    console.log(
      `💾 Resposta salva: questão ${questionId}, correto: ${isCorrect}`
    );
    console.log(`📊 Dados da resposta:`, {
      profileId: profileId,
      questionId: questionId,
      answer: answer,
      isCorrect: isCorrect,
    });
  }
}
