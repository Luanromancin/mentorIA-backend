const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initializeUserCompetencies() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Inicializando competências dos usuários...');

    // 1. Buscar todos os usuários
    const usersResult = await client.query('SELECT id FROM profiles');
    const users = usersResult.rows;

    // 2. Buscar todas as competências
    const competenciesResult = await client.query('SELECT id, name FROM competencies');
    const competencies = competenciesResult.rows;

    console.log(`📊 Encontrados ${users.length} usuários e ${competencies.length} competências`);

    // 3. Para cada usuário, criar registros de competência com nível 0
    for (const user of users) {
      for (const competency of competencies) {
        // Verificar se já existe
        const existingResult = await client.query(
          'SELECT 1 FROM user_competencies WHERE profile_id = $1 AND competency_id = $2',
          [user.id, competency.id]
        );

        if (existingResult.rows.length === 0) {
          // Inserir com nível 0 (iniciante)
          await client.query(
            `INSERT INTO user_competencies (profile_id, competency_id, level, last_evaluated_at)
             VALUES ($1, $2, 0, CURRENT_TIMESTAMP)`,
            [user.id, competency.id]
          );
          
          console.log(`✅ Usuário ${user.id}: competência ${competency.name} inicializada`);
        } else {
          console.log(`⏭️ Usuário ${user.id}: competência ${competency.name} já existe`);
        }
      }
    }

    console.log('🎉 Inicialização de competências concluída!');

  } catch (error) {
    console.error('❌ Erro durante inicialização:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeUserCompetencies()
    .then(() => {
      console.log('✅ Script executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script:', error);
      process.exit(1);
    });
}

module.exports = { initializeUserCompetencies }; 