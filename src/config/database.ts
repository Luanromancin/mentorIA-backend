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

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.DB_HOST || 'localhost',
  port: parseInt(env.DB_PORT || '5432'),
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
