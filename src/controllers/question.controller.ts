import { Router, Request, Response } from 'express';
import { Result, SuccessResult } from '../utils/result';
import { QuestionService } from '../services/question.service';
import { di } from '../di';

class QuestionController {
  private prefix: string = '/subjects';
  public router: Router;
  private questionService: QuestionService;

  constructor(router: Router) {
    this.router = router;
    this.questionService = di.getService(QuestionService);
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(
      `${this.prefix}/:subjectId/questions`,
      (req: Request, res: Response) => this.getQuestions(req, res),
    );
  }

  private async getQuestions(req: Request, res: Response) {
    const { subjectId } = req.params;
    const n = req.query.n ? parseInt(req.query.n as string, 10) : 10; // Default to 10 questions

    const questions = await this.questionService.getQuestions(subjectId, n);

    return new SuccessResult({
      msg: Result.transformRequestOnMsg(req),
      data: questions,
    }).handle(res);
  }
}

export default QuestionController; 