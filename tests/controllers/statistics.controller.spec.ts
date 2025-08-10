import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { StatisticsController } from '../../src/controllers/statistics.controller';
import { StatisticsService } from '../../src/services/statistics.service';
import { HttpError } from '../../src/utils/http-error';

// Mock do StatisticsService
vi.mock('../../src/services/statistics.service');

describe('StatisticsController', () => {
  let statisticsController: StatisticsController;
  let mockStatisticsService: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: any;
  let mockStatus: any;

  beforeEach(() => {
    mockJson = vi.fn().mockReturnThis();
    mockStatus = vi.fn().mockReturnThis();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    mockStatisticsService = vi.mocked(new StatisticsService());
    (StatisticsService as any).mockImplementation(() => mockStatisticsService);

    statisticsController = new StatisticsController();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('recordAnswer', () => {
    it('should record answer successfully', async () => {
      const userId = 'user-123';
      const requestBody = {
        questionId: 'question-123',
        subtopicName: 'JavaScript Basics',
        topicName: 'Programming',
        isCorrect: true,
      };

      mockRequest = {
        user: { id: userId },
        body: requestBody,
      };

      mockStatisticsService.recordAnswer = vi.fn().mockResolvedValue(undefined);

      await statisticsController.recordAnswer(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatisticsService.recordAnswer).toHaveBeenCalledWith(userId, requestBody);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Resposta registrada com sucesso',
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
        body: {},
      };

      await statisticsController.recordAnswer(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não autenticado',
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const userId = 'user-123';
      mockRequest = {
        user: { id: userId },
        body: {
          questionId: 'question-123',
          // Missing subtopicName, topicName, isCorrect
        },
      };

      await statisticsController.recordAnswer(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Campos obrigatórios: questionId, subtopicName, topicName, isCorrect',
      });
    });

    it('should return 400 when isCorrect is not boolean', async () => {
      const userId = 'user-123';
      mockRequest = {
        user: { id: userId },
        body: {
          questionId: 'question-123',
          subtopicName: 'JavaScript Basics',
          topicName: 'Programming',
          isCorrect: 'true', // Should be boolean
        },
      };

      await statisticsController.recordAnswer(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Campos obrigatórios: questionId, subtopicName, topicName, isCorrect',
      });
    });

    it('should handle service errors', async () => {
      const userId = 'user-123';
      const requestBody = {
        questionId: 'question-123',
        subtopicName: 'JavaScript Basics',
        topicName: 'Programming',
        isCorrect: true,
      };

      mockRequest = {
        user: { id: userId },
        body: requestBody,
      };

      const error = new HttpError(500, 'Service error');
      mockStatisticsService.recordAnswer = vi.fn().mockRejectedValue(error);

      await statisticsController.recordAnswer(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Service error',
      });
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics successfully', async () => {
      const userId = 'user-123';
      const mockStatistics = {
        general: {
          total_questions: 100,
          total_correct: 80,
          overall_accuracy: 80.0,
        },
        by_topic: [],
        by_competency: [],
      };

      mockRequest = {
        user: { id: userId },
      };

      mockStatisticsService.getUserStatistics = vi.fn().mockResolvedValue(mockStatistics);

      await statisticsController.getUserStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatisticsService.getUserStatistics).toHaveBeenCalledWith(userId);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
      };

      await statisticsController.getUserStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não autenticado',
      });
    });

    it('should handle service errors', async () => {
      const userId = 'user-123';
      mockRequest = {
        user: { id: userId },
      };

      const error = new HttpError(500, 'Service error');
      mockStatisticsService.getUserStatistics = vi.fn().mockRejectedValue(error);

      await statisticsController.getUserStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Service error',
      });
    });
  });

  describe('getCompetencyStatistics', () => {
    it('should return competency statistics successfully', async () => {
      const userId = 'user-123';
      const subtopicName = 'JavaScript Basics';
      const mockStatistics = {
        questions_answered: 20,
        correct_answers: 16,
        accuracy_percentage: 80,
      };

      mockRequest = {
        user: { id: userId },
        params: { subtopicName },
      };

      mockStatisticsService.getCompetencyStatistics = vi.fn().mockResolvedValue(mockStatistics);

      await statisticsController.getCompetencyStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatisticsService.getCompetencyStatistics).toHaveBeenCalledWith(userId, subtopicName);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
        params: { subtopicName: 'JavaScript Basics' },
      };

      await statisticsController.getCompetencyStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não autenticado',
      });
    });

    it('should return 400 when subtopicName is missing', async () => {
      const userId = 'user-123';
      mockRequest = {
        user: { id: userId },
        params: {},
      };

      await statisticsController.getCompetencyStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Nome do subtópico é obrigatório',
      });
    });

    it('should handle service errors', async () => {
      const userId = 'user-123';
      const subtopicName = 'JavaScript Basics';
      mockRequest = {
        user: { id: userId },
        params: { subtopicName },
      };

      const error = new HttpError(500, 'Service error');
      mockStatisticsService.getCompetencyStatistics = vi.fn().mockRejectedValue(error);

      await statisticsController.getCompetencyStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Service error',
      });
    });
  });

  describe('getTopicStatistics', () => {
    it('should return topic statistics successfully', async () => {
      const userId = 'user-123';
      const topicName = 'Programming';
      const mockStatistics = {
        questions_answered: 50,
        correct_answers: 40,
        accuracy_percentage: 80,
      };

      mockRequest = {
        user: { id: userId },
        params: { topicName },
      };

      mockStatisticsService.getTopicStatistics = vi.fn().mockResolvedValue(mockStatistics);

      await statisticsController.getTopicStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatisticsService.getTopicStatistics).toHaveBeenCalledWith(userId, topicName);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics,
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequest = {
        user: undefined,
        params: { topicName: 'Programming' },
      };

      await statisticsController.getTopicStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Usuário não autenticado',
      });
    });

    it('should return 400 when topicName is missing', async () => {
      const userId = 'user-123';
      mockRequest = {
        user: { id: userId },
        params: {},
      };

      await statisticsController.getTopicStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Nome do tópico é obrigatório',
      });
    });

    it('should handle service errors', async () => {
      const userId = 'user-123';
      const topicName = 'Programming';
      mockRequest = {
        user: { id: userId },
        params: { topicName },
      };

      const error = new HttpError(500, 'Service error');
      mockStatisticsService.getTopicStatistics = vi.fn().mockRejectedValue(error);

      await statisticsController.getTopicStatistics(
        mockRequest as any,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Service error',
      });
    });
  });
});
