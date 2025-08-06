import { Request, Response } from 'express';
import { StatisticsService } from '../services/statistics.service';

export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  /**
   * GET /api/statistics/user
   * Busca estatísticas completas do usuário
   */
  async getUserStatistics(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      console.log(`📊 Buscando estatísticas para usuário ${profileId}`);

      const statistics = await this.statisticsService.getUserStatistics(
        profileId
      );

      return res.json({
        success: true,
        data: statistics,
        message: 'Estatísticas carregadas com sucesso',
      });
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * GET /api/statistics/competencies
   * Busca estatísticas de competências do usuário
   */
  async getCompetencyStatistics(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const competencyStats =
        await this.statisticsService.getUserCompetencyStatistics(profileId);

      return res.json({
        success: true,
        data: competencyStats,
        message: 'Estatísticas de competências carregadas com sucesso',
      });
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de competências:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * GET /api/statistics/competencies/progress
   * Busca progresso detalhado por competência
   */
  async getCompetencyProgress(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const competencyProgress =
        await this.statisticsService.getCompetencyProgress(profileId);

      return res.json({
        success: true,
        data: competencyProgress,
        message: 'Progresso de competências carregado com sucesso',
      });
    } catch (error) {
      console.error('❌ Erro ao buscar progresso de competências:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  /**
   * POST /api/statistics/answer
   * Salva uma resposta do usuário
   */
  async saveUserAnswer(req: Request, res: Response): Promise<Response> {
    try {
      const profileId = (req as any).user?.id;
      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      const { questionId, selectedAlternativeId, isCorrect, timeSpentSeconds } =
        req.body;

      console.log('💾 Salvando resposta:', {
        profileId,
        questionId,
        selectedAlternativeId,
        isCorrect,
        timeSpentSeconds,
      });

      if (!questionId || isCorrect === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Dados incompletos para salvar resposta',
        });
      }

      await this.statisticsService.saveUserAnswer({
        profileId,
        questionId,
        selectedAlternativeId,
        isCorrect,
        timeSpentSeconds,
      });

      console.log('✅ Resposta salva com sucesso');

      return res.json({
        success: true,
        message: 'Resposta salva com sucesso',
      });
    } catch (error) {
      console.error('❌ Erro ao salvar resposta:', error);
      console.error('❌ Stack trace:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
