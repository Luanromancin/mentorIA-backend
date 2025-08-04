const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserCompetencies() {
  const userId = '9da00b0d-d2f7-4589-9321-8179553f2b47'; // ID do usuário Gabriela Lima
  
  console.log(`🔍 Verificando competências do usuário: ${userId}`);
  
  try {
    // Verificar competências do usuário
    const { data: userCompetencies, error } = await client
      .from('user_competencies')
      .select(`
        competency_id,
        level,
        last_evaluated_at,
        competencies (
          code,
          name
        )
      `)
      .eq('profile_id', userId);

    if (error) {
      console.error('❌ Erro ao buscar competências do usuário:', error);
      return;
    }

    console.log(`✅ Usuário tem ${userCompetencies.length} competências:`);
    
    // Mostrar algumas competências como exemplo
    userCompetencies.slice(0, 10).forEach(uc => {
      console.log(`   - ${uc.competencies.code}: ${uc.competencies.name} (nível ${uc.level})`);
    });
    
    if (userCompetencies.length > 10) {
      console.log(`   ... e mais ${userCompetencies.length - 10} competências`);
    }

    // Verificar distribuição por nível
    const levelDistribution = {};
    userCompetencies.forEach(uc => {
      const level = uc.level;
      levelDistribution[level] = (levelDistribution[level] || 0) + 1;
    });

    console.log('\n📊 Distribuição por nível:');
    Object.keys(levelDistribution).sort().forEach(level => {
      console.log(`   Nível ${level}: ${levelDistribution[level]} competências`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkUserCompetencies(); 