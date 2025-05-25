import { Express, Router } from 'express';
import { di } from '../di';
import TestController from '../controllers/test.controller';
import TestService from '../services/test.service';
import authRoutes from './auth.routes';

const router = Router();
const prefix = '/api';

export default function setupRoutes(app: Express): void {
  app.use(
    prefix,
    new TestController(router, di.getService(TestService)).router
  );
  app.use('/api/auth', authRoutes);
}
