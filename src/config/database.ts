import { Sequelize } from 'sequelize';
import env from '../env';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize; 