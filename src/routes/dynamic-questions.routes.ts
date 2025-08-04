import { Router } from 'express';
import { DynamicQuestionsController } from '../controllers/dynamic-questions.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DynamicQuestionsController();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * GET /api/questions/dynamic
 * Busca questões dinâmicas baseadas no nível de competência do usuário
 * Query params:
 * - maxQuestions: número máximo de questões (default: 20)
 */
router.get('/dynamic', controller.getDynamicQuestions.bind(controller));

/**
 * POST /api/questions/answer
 * Submete resposta do usuário e atualiza nível de competência
 * Body:
 * {
 *   questionId: string,
 *   selectedAlternativeId: string | null,
 *   isCorrect: boolean,
 *   competencyName: string,
 *   timeSpentSeconds?: number
 * }
 */
router.post('/answer', controller.submitAnswer.bind(controller));

/**
 * GET /api/competencies/user
 * Busca competências do usuário com níveis
 */
router.get('/competencies/user', controller.getUserCompetencies.bind(controller));

export default router; 