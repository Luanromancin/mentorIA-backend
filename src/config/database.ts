import { Sequelize } from 'sequelize';
import env from '../env';

// Função para criar configuração do banco
const createDatabaseConfig = () => {
  // Usar SQLite em memória para testes e produção (Render)
  if (env.NODE_ENV === 'test' || env.NODE_ENV === 'production') {
    console.log(`🔧 Usando SQLite em memória para ${env.NODE_ENV}`);
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

  // Para desenvolvimento local, usar SQLite local
  console.log('🔧 Usando SQLite local para desenvolvimento');
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
