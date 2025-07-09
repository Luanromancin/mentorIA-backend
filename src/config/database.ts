import { Sequelize } from 'sequelize';
import env from '../env';

// Log para debug
console.log('Configurações do banco:', {
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  username: env.DB_USER,
  // Não logamos a senha por segurança
});

// Usar SQLite em memória para testes
const sequelize =
  env.NODE_ENV === 'test'
    ? new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
        define: {
          timestamps: true,
          underscored: true,
        },
      })
    : new Sequelize({
        dialect: 'postgres',
        host: env.DB_HOST || 'localhost',
        port: env.DB_PORT,
        database: env.DB_NAME,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        logging: false,
        define: {
          timestamps: true,
          underscored: true,
        },
      });

export default sequelize;
