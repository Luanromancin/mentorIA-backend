import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { StatisticsService } from '../../src/services/statistics.service';
import { createClient } from '@supabase/supabase-js';

// Mock do Supabase
vi.mock('@supabase/supabase-js');

describe('StatisticsService', () => {
  let statisticsService: StatisticsService;
  let mockSupabase: any;

  beforeEach(() => {
    // Mock das variáveis de ambiente
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';

    // Mock do cliente Supabase
    mockSupabase = {
      rpc: vi.fn(),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
    };



    (createClient as any).mockReturnValue(mockSupabase);
    statisticsService = new StatisticsService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('recordAnswer', () => {
    it('should record answer successfully', async () => {
      const userId = 'user-123';
      const answer = {
        questionId: 'question-123',
        subtopicName: 'JavaScript Basics',
        topicName: 'Programming',
        isCorrect: true,
      };

      mockSupabase.rpc.mockResolvedValue({ error: null });

      await expect(statisticsService.recordAnswer(userId, answer)).resolves.not.toThrow();

      expect(mockSupabase.rpc).toHaveBeenCalledWith('upsert_user_statistics', {
        p_user_id: userId,
        p_subtopic_name: answer.subtopicName,
        p_topic_name: answer.topicName,
        p_is_correct: answer.isCorrect,
      });
    });

    it('should throw error when Supabase returns error', async () => {
      const userId = 'user-123';
      const answer = {
        questionId: 'question-123',
        subtopicName: 'JavaScript Basics',
        topicName: 'Programming',
        isCorrect: true,
      };

      mockSupabase.rpc.mockResolvedValue({
        error: { message: 'Database error' },
      });

      await expect(statisticsService.recordAnswer(userId, answer)).rejects.toThrow(
        'Erro ao registrar resposta: Database error'
      );
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics successfully', async () => {
      const userId = 'user-123';
      const mockData = {
        general: {
          total_questions: 100,
          total_correct: 80,
          overall_accuracy: 80.0,
        },
        by_topic: [],
        by_competency: [],
      };

      mockSupabase.rpc.mockResolvedValue({ data: mockData, error: null });

      const result = await statisticsService.getUserStatistics(userId);

      expect(result).toEqual(mockData);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_statistics', {
        user_profile_id: userId,
      });
    });

    it('should return empty statistics when no data exists', async () => {
      const userId = 'user-123';

      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const result = await statisticsService.getUserStatistics(userId);

      expect(result).toEqual({
        general: {
          total_questions: 0,
          total_correct: 0,
          overall_accuracy: 0,
          completed_tests: 0,
          study_streak: 0,
        },
        by_topic: [],
        by_competency: [],
      });
    });

    it('should throw error when Supabase returns error', async () => {
      const userId = 'user-123';

      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(statisticsService.getUserStatistics(userId)).rejects.toThrow(
        'Erro ao obter estatísticas: Database error'
      );
    });
  });

  describe('getCompetencyStatistics', () => {
    it('should return competency statistics successfully', async () => {
      const userId = 'user-123';
      const subtopicName = 'JavaScript Basics';
      const mockData = {
        questions_answered: 20,
        correct_answers: 16,
      };

      mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

      const result = await statisticsService.getCompetencyStatistics(userId, subtopicName);

      expect(result).toEqual({
        questions_answered: 20,
        correct_answers: 16,
        accuracy_percentage: 80,
      });
    });

    it('should return null when no data exists', async () => {
      const userId = 'user-123';
      const subtopicName = 'JavaScript Basics';

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await statisticsService.getCompetencyStatistics(userId, subtopicName);

      expect(result).toBeNull();
    });

    it('should throw error when Supabase returns error', async () => {
      const userId = 'user-123';
      const subtopicName = 'JavaScript Basics';

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        statisticsService.getCompetencyStatistics(userId, subtopicName)
      ).rejects.toThrow('Erro ao obter estatísticas da competência: Database error');
    });
  });

  describe('getTopicStatistics', () => {
    it('should return topic statistics successfully', async () => {
      const userId = 'user-123';
      const topicName = 'Programming';
      const mockData = [
        { questions_answered: 10, correct_answers: 8 },
        { questions_answered: 15, correct_answers: 12 },
      ];

      // Configurar mock para retornar dados na segunda chamada .eq()
      let eqCallCount = 0;
      mockSupabase.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 2) {
          return Promise.resolve({
            data: mockData,
            error: null,
          });
        }
        return mockSupabase;
      });

      const result = await statisticsService.getTopicStatistics(userId, topicName);

      expect(result).toEqual({
        questions_answered: 25,
        correct_answers: 20,
        accuracy_percentage: 80,
      });
    });

    it('should return null when no data exists', async () => {
      const userId = 'user-123';
      const topicName = 'Programming';

      // Configurar mock para retornar array vazio na segunda chamada .eq()
      let eqCallCount = 0;
      mockSupabase.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 2) {
          return Promise.resolve({
            data: [],
            error: null,
          });
        }
        return mockSupabase;
      });

      const result = await statisticsService.getTopicStatistics(userId, topicName);

      expect(result).toBeNull();
    });

    it('should throw error when Supabase returns error', async () => {
      const userId = 'user-123';
      const topicName = 'Programming';

      // Configurar mock para retornar erro na segunda chamada .eq()
      let eqCallCount = 0;
      mockSupabase.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount === 2) {
          return Promise.resolve({
            data: null,
            error: { message: 'Database error' },
          });
        }
        return mockSupabase;
      });

      await expect(statisticsService.getTopicStatistics(userId, topicName)).rejects.toThrow(
        'Erro ao obter estatísticas do tópico: Database error'
      );
    });
  });
});
