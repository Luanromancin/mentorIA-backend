import app from './app';
import env from './env';
import logger from './logger';

const port = env.PORT;

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Timeout para inicialização
const server = app.listen(port, () => {
  logger.info(`Servidor rodando na porta ${port}`);
});

// Timeout de 30 segundos para conexões
server.timeout = 30000;

// Tratamento de erro do servidor
server.on('error', (error) => {
  console.error('❌ Erro do servidor:', error);
  process.exit(1);
});
