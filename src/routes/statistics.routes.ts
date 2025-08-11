import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const statisticsController = new StatisticsController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// POST /api/statistics/record-answer
// Registra uma resposta do usuário
router.post(
  '/record-answer',
  statisticsController.recordAnswer.bind(statisticsController)
);

// GET /api/statistics/user
// Obtém estatísticas completas do usuário
router.get(
  '/user',
  statisticsController.getUserStatistics.bind(statisticsController)
);

// GET /api/statistics/competency/:subtopicName
// Obtém estatísticas por competência específica
router.get(
  '/competency/:subtopicName',
  statisticsController.getCompetencyStatistics.bind(statisticsController)
);

// GET /api/statistics/topic/:topicName
// Obtém estatísticas por tópico específico
router.get(
  '/topic/:topicName',
  statisticsController.getTopicStatistics.bind(statisticsController)
);

// GET /api/statistics/ranking
// Obtém ranking de competências do usuário
router.get(
  '/ranking',
  statisticsController.getCompetencyRanking.bind(statisticsController)
);

// GET /api/statistics/weak-competencies
// Obtém competências que precisam de mais atenção
router.get(
  '/weak-competencies',
  statisticsController.getWeakCompetencies.bind(statisticsController)
);

// GET /api/statistics/available-topics
// Obtém todos os tópicos e subtópicos disponíveis na tabela questions
router.get(
  '/available-topics',
  statisticsController.getAvailableTopics.bind(statisticsController)
);

// Rota para registrar estudo diário
router.post(
  '/register-daily-study',
  authMiddleware,
  statisticsController.registerDailyStudy.bind(statisticsController)
);

export default router;
