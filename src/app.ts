import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import logger from './logger';
import setupRoutes from './routes/index';
import { HttpError } from './utils/errors/http.error';
import { FailureResult } from './utils/result';
import { initDatabase } from './database';
import env from './env';

const app: express.Express = express();
app.use(express.json());

// Configuração do CORS para desenvolvimento e produção
const corsOptions = {
  origin: env.NODE_ENV === 'production' 
    ? [env.FRONTEND_URL, 'https://mentoria-frontend.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
};

app.use(cors(corsOptions));

// Inicializa o banco de dados
initDatabase().catch((error) => {
  logger.error('Erro ao inicializar o banco de dados:', error);
  process.exit(1);
});

setupRoutes(app);

// Middleware de erro
app.use(
  (
    error: HttpError,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (error.status >= 500) {
      logger.error(error.toString());
    }

    new FailureResult({
      msg: error.msg ?? error.message,
      msgCode: error.msgCode,
      code: error.status,
    }).handle(res);
  }
);

export default app;
