import { Express, Router } from 'express';
import { di } from '../di';
import TestController from '../controllers/test.controller';
import TestService from '../services/test.service';
import authRoutes from './auth.routes';
import supabaseAuthRoutes from './supabase-auth.routes';
import QuestionController from '../controllers/question.controller';

const router = Router();
const prefix = '/api';

export default function setupRoutes(app: Express): void {
  app.use(
    prefix,
    new TestController(router, di.getService(TestService)).router
  );
  app.use('/api/auth', authRoutes);
  app.use('/api/supabase-auth', supabaseAuthRoutes);
  app.use(
    prefix,
    new QuestionController(router).router
  );
}
