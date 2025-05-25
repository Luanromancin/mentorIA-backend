import app from './app';
import env from './env';
import logger from './logger';

const port = parseInt(env.PORT, 10);

app.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
});
