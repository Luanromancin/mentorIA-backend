import { Sequelize } from 'sequelize';
import env from '../env';

// Função para criar configuração do banco
const createDatabaseConfig = () => {
  // Usar SQLite em memória para testes
  if (env.NODE_ENV === 'test') {
    console.log('🔧 Usando SQLite em memória para testes');
    return {
      dialect: 'sqlite' as const,
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    };
  }

  // Para desenvolvimento e produção, usar SQLite local
  // O Supabase será usado apenas via API para autenticação e operações específicas
  console.log('🔧 Usando SQLite local para dados da aplicação');
  console.log('🔧 Supabase será usado apenas via API para autenticação');

  return {
    dialect: 'sqlite' as const,
    storage: './dev.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  };
};

const sequelize = new Sequelize(createDatabaseConfig());

export default sequelize;
