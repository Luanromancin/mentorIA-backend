import TestEntity from '../entities/test.entity';
import sequelize from '../config/database';
import Profile from '../models/profile.model';

export default class Database {
  data: { [key: string]: any[] };
  private static instance: Database;

  private constructor() {
    this.data = {};
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  static reset() {
    Database.instance = new Database();
  }

  static seed() {
    Database.getInstance().data = {
      tests: [
        new TestEntity({
          id: '89ecc32a-aec7-4b71-adfd-03287e4ca74f',
          name: 'Test Seed',
        }),
      ],
    };
  }
}

export async function initDatabase() {
  try {
    await sequelize.authenticate();
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Database connection has been established successfully.');
    }

    // Sincronizar as tabelas
    await sequelize.sync({ force: false });
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Database synchronized successfully.');
    }

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

export async function closeDatabase() {
  try {
    await sequelize.close();
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Database connection closed successfully.');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

export { Profile };
