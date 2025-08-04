import { Express, Router } from 'express';
import { di } from '../di';
import TestController from '../controllers/test.controller';
import TestService from '../services/test.service';
import unifiedAuthRoutes from './unified-auth.routes';
import QuestionController from '../controllers/question.controller';
import dynamicQuestionsRoutes from './dynamic-questions.routes';

const router = Router();
const prefix = '/api';

export default function setupRoutes(app: Express): void {
  app.use(
    prefix,
    new TestController(router, di.getService(TestService)).router
  );
  app.use('/api/auth', unifiedAuthRoutes);
  app.use(prefix, new QuestionController(router).router);
  app.use('/api/questions', dynamicQuestionsRoutes);
}
