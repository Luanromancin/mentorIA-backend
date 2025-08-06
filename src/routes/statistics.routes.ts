import { Router } from 'express';
import { StatisticsController } from '../controllers/statistics.controller';
import { StatisticsService } from '../services/statistics.service';
import { UserAnswerRepository } from '../repositories/user-answer.repository';
import { UserCompetencyRepository } from '../repositories/user-competency.repository';
import { SupabaseAuthMiddleware } from '../middlewares/supabase-auth.middleware';

const router = Router();

// Instanciar dependências
const userAnswerRepository = new UserAnswerRepository();
const userCompetencyRepository = new UserCompetencyRepository();
const statisticsService = new StatisticsService(
  userAnswerRepository,
  userCompetencyRepository
);
const statisticsController = new StatisticsController(statisticsService);

// Middleware de autenticação
const supabaseAuthMiddleware = new SupabaseAuthMiddleware();
router.use((req, res, next) =>
  supabaseAuthMiddleware.authenticate(req, res, next)
);

// Rotas de estatísticas
router.get('/user', (req, res) =>
  statisticsController.getUserStatistics(req, res)
);
router.get('/competencies', (req, res) =>
  statisticsController.getCompetencyStatistics(req, res)
);
router.get('/competencies/progress', (req, res) =>
  statisticsController.getCompetencyProgress(req, res)
);
router.post('/answer', (req, res) =>
  statisticsController.saveUserAnswer(req, res)
);

export default router;
