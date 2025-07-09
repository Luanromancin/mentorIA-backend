import app from './app';
import env from './env';
import logger from './logger';

const port = env.PORT;

app.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
});
