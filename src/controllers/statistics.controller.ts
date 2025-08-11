import { Request, Response } from 'express';
import { StatisticsService } from '../services/statistics.service';
import { HttpError } from '../utils/http-error';
import Profile from '../models/profile.model';

// Extensão da interface Request para incluir o usuário autenticado
interface AuthenticatedRequest extends Request {
  user?: Profile;
}

export class StatisticsController {
  private statisticsService = new StatisticsService();

  /**
   * Registra uma resposta do usuário
   */
  async recordAnswer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const { questionId, subtopicName, topicName, isCorrect } = req.body;

      // Validação dos campos obrigatórios
      if (
        !questionId ||
        !subtopicName ||
        !topicName ||
        typeof isCorrect !== 'boolean'
      ) {
        throw new HttpError(
          400,
          'Campos obrigatórios: questionId, subtopicName, topicName, isCorrect'
        );
      }

      await this.statisticsService.recordAnswer(userId, {
        questionId,
        subtopicName,
        topicName,
        isCorrect,
      });

      res.status(200).json({
        success: true,
        message: 'Resposta registrada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao registrar resposta:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
        });
      }
    }
  }

  /**
   * Obtém estatísticas completas do usuário
   */
  async getUserStatistics(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const statistics = await this.statisticsService.getUserStatistics(userId);

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
        });
      }
    }
  }

  /**
   * Obtém estatísticas por competência específica
   */
  async getCompetencyStatistics(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const { subtopicName } = req.params;
      if (!subtopicName) {
        throw new HttpError(400, 'Nome do subtópico é obrigatório');
      }

      const statistics = await this.statisticsService.getCompetencyStatistics(
        userId,
        subtopicName
      );

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas da competência:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
        });
      }
    }
  }

  /**
   * Obtém estatísticas por tópico específico
   */
  async getTopicStatistics(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const { topicName } = req.params;
      if (!topicName) {
        throw new HttpError(400, 'Nome do tópico é obrigatório');
      }

      const statistics = await this.statisticsService.getTopicStatistics(
        userId,
        topicName
      );

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas do tópico:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
        });
      }
    }
  }

  /**
   * Obtém ranking de competências do usuário
   */
  async getCompetencyRanking(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const ranking = await this.statisticsService.getCompetencyRanking(userId);

      res.status(200).json({
        success: true,
        data: ranking,
      });
    } catch (error) {
      console.error('Erro ao obter ranking de competências:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
        });
      }
    }
  }

  /**
   * Obtém competências que precisam de mais atenção
   */
  async getWeakCompetencies(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const threshold = req.query.threshold ? Number(req.query.threshold) : 70;

      if (isNaN(threshold) || threshold < 0 || threshold > 100) {
        throw new HttpError(400, 'Threshold deve ser um número entre 0 e 100');
      }

      const weakCompetencies = await this.statisticsService.getWeakCompetencies(
        userId,
        threshold
      );

      res.status(200).json({
        success: true,
        data: {
          threshold,
          competencies: weakCompetencies,
        },
      });
    } catch (error) {
      console.error('Erro ao obter competências fracas:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
        });
      }
    }
  }

  /**
   * Obtém todos os tópicos e subtópicos disponíveis na tabela questions
   */
  async getAvailableTopics(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const topics = await this.statisticsService.getAvailableTopics();

      res.status(200).json({
        success: true,
        data: topics,
      });
    } catch (error) {
      console.error('Erro ao obter tópicos disponíveis:', error);
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Erro interno do servidor',
        });
      }
    }
  }
}
