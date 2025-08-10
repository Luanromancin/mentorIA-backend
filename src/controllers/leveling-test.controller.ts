import { Router, Request, Response } from 'express';
import { LevelingTestService } from '../services/leveling-test.service';
import { SuccessResult } from '../utils/result';
import { authMiddleware } from '../middlewares/auth.middleware';

// Interface local para garantir tipagem
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
  };
}

class LevelingTestController {
  private prefix = '/leveling-test';
  public router: Router;
  private levelingTestService: LevelingTestService;

  constructor(router: Router, levelingTestService: LevelingTestService) {
    this.router = router;
    this.levelingTestService = levelingTestService;
    this.initRoutes();
  }

  private initRoutes() {
    // Iniciar teste de nivelamento
    this.router.post(
      `${this.prefix}/start`,
      authMiddleware,
      (req: AuthenticatedRequest, res: Response) => this.startTest(req, res)
    );

    // Responder questão
    this.router.post(
      `${this.prefix}/answer`,
      authMiddleware,
      (req: AuthenticatedRequest, res: Response) =>
        this.answerQuestion(req, res)
    );

    // Finalizar teste
    this.router.post(
      `${this.prefix}/complete`,
      authMiddleware,
      (req: AuthenticatedRequest, res: Response) => this.completeTest(req, res)
    );

    // Buscar progresso
    this.router.get(
      `${this.prefix}/progress/:sessionId`,
      authMiddleware,
      (req: AuthenticatedRequest, res: Response) => this.getProgress(req, res)
    );

    // Verificar se completou o teste
    this.router.get(
      `${this.prefix}/status`,
      authMiddleware,
      (req: AuthenticatedRequest, res: Response) => this.getStatus(req, res)
    );
  }

  private async startTest(req: AuthenticatedRequest, res: Response) {
    try {
      const profileId = req.user?.id;
      if (!profileId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const result = await this.levelingTestService.startTest(profileId);

      return new SuccessResult({
        msg: 'Teste de nivelamento iniciado com sucesso',
        data: result,
      }).handle(res);
    } catch (error) {
      console.error('Erro ao iniciar teste de nivelamento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  private async answerQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId, questionId, selectedAnswer } = req.body;

      if (!sessionId || !questionId || !selectedAnswer) {
        return res.status(400).json({
          error:
            'Dados obrigatórios não fornecidos: sessionId, questionId, selectedAnswer',
        });
      }

      const result = await this.levelingTestService.answerQuestion({
        sessionId,
        questionId,
        selectedAnswer,
      });

      return new SuccessResult({
        msg: 'Resposta registrada com sucesso',
        data: result,
      }).handle(res);
    } catch (error) {
      console.error('Erro ao responder questão:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  private async completeTest(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          error: 'sessionId é obrigatório',
        });
      }

      const result = await this.levelingTestService.completeTest(sessionId);

      return new SuccessResult({
        msg: 'Teste de nivelamento finalizado com sucesso',
        data: result,
      }).handle(res);
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  private async getProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'sessionId é obrigatório',
        });
      }

      const result = await this.levelingTestService.getProgress(sessionId);

      return new SuccessResult({
        msg: 'Progresso recuperado com sucesso',
        data: result,
      }).handle(res);
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  private async getStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const profileId = req.user?.id;
      if (!profileId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const hasCompleted =
        await this.levelingTestService.hasCompletedLevelingTest(profileId);

      return new SuccessResult({
        msg: 'Status do teste de nivelamento recuperado',
        data: { hasCompletedLevelingTest: hasCompleted },
      }).handle(res);
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}

export default LevelingTestController;
