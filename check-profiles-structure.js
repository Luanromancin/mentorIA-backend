const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesStructure() {
  console.log('🔍 Verificando estrutura da tabela profiles...');
  
  try {
    // Buscar alguns registros para ver a estrutura
    const { data: profiles, error } = await client
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao buscar perfis:', error);
      return;
    }

    if (profiles && profiles.length > 0) {
      console.log('✅ Estrutura da tabela profiles:');
      console.log(JSON.stringify(profiles[0], null, 2));
    } else {
      console.log('⚠️ Tabela profiles está vazia');
    }

    // Tentar buscar apenas algumas colunas básicas
    console.log('\n🔍 Tentando buscar colunas básicas...');
    const { data: basicProfiles, error: basicError } = await client
      .from('profiles')
      .select('id, email, name')
      .limit(1);

    if (basicError) {
      console.error('❌ Erro ao buscar colunas básicas:', basicError);
    } else {
      console.log('✅ Colunas básicas funcionam:', basicProfiles);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkProfilesStructure(); 