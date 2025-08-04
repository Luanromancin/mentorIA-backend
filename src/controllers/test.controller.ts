import { Router, Request, Response } from 'express';
import { Result, SuccessResult } from '../utils/result';
import TestService from '../services/test.service';
import { TestEntity } from '../entities/test.entity';

class TestController {
  private prefix = '/tests';
  public router: Router;
  private testService: TestService;

  constructor(router: Router, testService: TestService) {
    this.router = router;
    this.testService = testService;
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(this.prefix, (req: Request, res: Response) =>
      this.getTests(req, res)
    );

    this.router.get(`${this.prefix}/others`, (req: Request, res: Response) =>
      this.getOthersTests(req, res)
    );

    this.router.get(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.getTest(req, res)
    );
    this.router.post(this.prefix, (req: Request, res: Response) =>
      this.createTest(req, res)
    );
    this.router.put(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.updateTest(req, res)
    );
    this.router.delete(`${this.prefix}/:id`, (req: Request, res: Response) =>
      this.deleteTest(req, res)
    );

    // Novas rotas para fluxo otimizado
    this.router.get('/questions/session', (req: Request, res: Response) =>
      this.getSessionQuestions(req, res)
    );
    this.router.post('/questions/session/complete', (req: Request, res: Response) =>
      this.completeSession(req, res)
    );
    
    // Rota para pré-carregamento após login
    this.router.post('/questions/preload', (req: Request, res: Response) =>
      this.preloadUserData(req, res)
    );
    
    // Rota para métricas de performance
    this.router.get('/performance/metrics', (req: Request, res: Response) =>
      this.getPerformanceMetrics(req, res)
    );
    
    // Rota para verificar questões sem alternativas
    this.router.get('/questions/check-incomplete', (req: Request, res: Response) =>
      this.checkIncompleteQuestions(req, res)
    );
    
    // Rota para remover questões sem alternativas
    this.router.delete('/questions/remove-incomplete', (req: Request, res: Response) =>
      this.removeIncompleteQuestions(req, res)
    );
  }

  private async getTests(req: Request, res: Response) {
    const tests = await this.testService.getTests();

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: tests,
    }).handle(res);
  }

  private async getOthersTests(req: Request, res: Response) {
    const tests = await this.testService.getOtherTests();

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: tests,
    }).handle(res);
  }

  private async getTest(req: Request, res: Response) {
    const test = await this.testService.getTest(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: test,
    }).handle(res);
  }

  private async createTest(req: Request, res: Response) {
    const test = await this.testService.createTest(req.body as TestEntity);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: test,
    }).handle(res);
  }

  private async updateTest(req: Request, res: Response) {
    const test = await this.testService.updateTest(
      req.params.id,
      req.body as TestEntity
    );

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: test,
    }).handle(res);
  }

  private async deleteTest(req: Request, res: Response) {
    await this.testService.deleteTest(req.params.id);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
    }).handle(res);
  }

  // Nova rota: Carregar competências + questões de uma vez
  private async getSessionQuestions(req: Request, res: Response) {
    try {
      const { maxQuestions = 20 } = req.query;
      // Por enquanto, usar um ID fixo para teste
      const profileId = '9da00b0d-d2f7-4589-9321-8179553f2b47';

      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      const sessionData = await this.testService.getSessionQuestions(
        profileId, 
        parseInt(maxQuestions as string)
      );

      return new SuccessResult({
        msg: 'Sessão de questões carregada com sucesso',
        data: sessionData,
      }).handle(res);
    } catch (error: any) {
      console.error('Erro ao carregar sessão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Nova rota: Finalizar sessão e atualizar competências
  private async completeSession(req: Request, res: Response) {
    try {
      const { answers } = req.body;
      // Por enquanto, usar um ID fixo para teste
      const profileId = '9da00b0d-d2f7-4589-9321-8179553f2b47';

      if (!profileId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }

      await this.testService.completeSession(profileId, answers);

      return new SuccessResult({
        msg: 'Sessão finalizada e competências atualizadas com sucesso',
        data: { success: true },
      }).handle(res);
    } catch (error: any) {
      console.error('Erro ao finalizar sessão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Pré-carregar dados do usuário após login
  private async preloadUserData(_req: Request, res: Response) {
    try {
      const profileId = '9da00b0d-d2f7-4589-9321-8179553f2b47'; // ID fixo para teste
      
      console.log('🚀 Iniciando pré-carregamento para usuário:', profileId);
      
      // Pré-carregar competências em background
      const competencies = await this.testService.preloadUserCompetencies(profileId);
      
      return new SuccessResult({
        msg: 'Dados pré-carregados com sucesso',
        data: {
          competenciesLoaded: competencies.length,
          message: 'Competências carregadas em background'
        },
      }).handle(res);
    } catch (error: any) {
      console.error('Erro no pré-carregamento:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro no pré-carregamento'
      });
    }
  }

  // Obter métricas de performance
  private async getPerformanceMetrics(_req: Request, res: Response) {
    try {
      const { PerformanceMonitor } = await import('../utils/performance');
      const { CacheService } = await import('../services/cache.service');
      
      const metrics = PerformanceMonitor.getMetrics();
      const cacheStats = CacheService.getStats();
      
      return new SuccessResult({
        msg: 'Métricas de performance',
        data: {
          performance: metrics,
          cache: cacheStats
        },
      }).handle(res);
    } catch (error: any) {
      console.error('Erro ao obter métricas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter métricas'
      });
    }
  }

  // Verificar questões sem alternativas
  private async checkIncompleteQuestions(_req: Request, res: Response) {
    try {
      const { DatabaseService } = await import('../services/database.service');
      const dbService = new DatabaseService();
      
      const incompleteQuestions = await dbService.checkQuestionsWithoutAlternatives();
      
      return new SuccessResult({
        msg: 'Verificação de questões incompletas concluída',
        data: {
          totalIncomplete: incompleteQuestions.length,
          questions: incompleteQuestions
        },
      }).handle(res);
    } catch (error: any) {
      console.error('Erro ao verificar questões incompletas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar questões incompletas'
      });
    }
  }

  // Remover questões sem alternativas
  private async removeIncompleteQuestions(_req: Request, res: Response) {
    try {
      const { DatabaseService } = await import('../services/database.service');
      const dbService = new DatabaseService();
      
      const result = await dbService.removeQuestionsWithoutAlternatives();
      
      return new SuccessResult({
        msg: 'Questões sem alternativas removidas com sucesso',
        data: {
          removedCount: result.removedCount,
          message: `Removidas ${result.removedCount} questões sem alternativas`
        },
      }).handle(res);
    } catch (error: any) {
      console.error('Erro ao remover questões incompletas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao remover questões incompletas'
      });
    }
  }
}

export default TestController;
