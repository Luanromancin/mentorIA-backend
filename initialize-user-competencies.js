const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseServiceKey);

async function initializeUserCompetencies() {
  // Usando um UUID que já existe no sistema
  const userId = '9da00b0d-d2f7-4589-9321-8179553f2b47'; // ID do usuário Gabriela Lima
  
  console.log(`🔧 Inicializando competências para usuário: ${userId}`);
  
  try {
    // 1. Buscar todas as competências
    console.log('1️⃣ Buscando competências disponíveis...');
    const { data: competencies, error: competenciesError } = await client
      .from('competencies')
      .select('id, code, name')
      .order('code');

    if (competenciesError) {
      console.error('❌ Erro ao buscar competências:', competenciesError);
      return;
    }

    console.log(`✅ Encontradas ${competencies.length} competências:`);
    competencies.slice(0, 5).forEach(comp => {
      console.log(`   - ${comp.code}: ${comp.name}`);
    });
    if (competencies.length > 5) {
      console.log(`   ... e mais ${competencies.length - 5} competências`);
    }

    // 2. Verificar competências existentes do usuário
    console.log('\n2️⃣ Verificando competências existentes do usuário...');
    const { data: existingUserCompetencies, error: existingError } = await client
      .from('user_competencies')
      .select('competency_id, level')
      .eq('profile_id', userId);

    if (existingError) {
      console.error('❌ Erro ao buscar competências existentes:', existingError);
      return;
    }

    console.log(`✅ Usuário já tem ${existingUserCompetencies.length} competências inicializadas`);

    // 3. Identificar competências que precisam ser inicializadas
    const existingCompetencyIds = existingUserCompetencies.map(uc => uc.competency_id);
    const competenciesToInitialize = competencies.filter(comp => 
      !existingCompetencyIds.includes(comp.id)
    );

    console.log(`📊 Competências para inicializar: ${competenciesToInitialize.length}`);

    if (competenciesToInitialize.length === 0) {
      console.log('✅ Todas as competências já estão inicializadas!');
      return;
    }

    // 4. Inicializar competências faltantes
    console.log('\n3️⃣ Inicializando competências faltantes...');
    const userCompetenciesToInsert = competenciesToInitialize.map(comp => ({
      profile_id: userId,
      competency_id: comp.id,
      level: 0, // Nível inicial
      last_evaluated_at: new Date().toISOString()
    }));

    const { data: insertedData, error: insertError } = await client
      .from('user_competencies')
      .insert(userCompetenciesToInsert)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir competências:', insertError);
      return;
    }

    console.log(`✅ ${insertedData.length} competências inicializadas com sucesso!`);

    // 5. Verificar resultado final
    console.log('\n4️⃣ Verificando resultado final...');
    const { data: finalUserCompetencies, error: finalError } = await client
      .from('user_competencies')
      .select(`
        competency_id,
        level,
        competencies!inner (
          code,
          name
        )
      `)
      .eq('profile_id', userId)
      .order('competencies.code');

    if (finalError) {
      console.error('❌ Erro ao verificar resultado final:', finalError);
      return;
    }

    console.log(`✅ Usuário agora tem ${finalUserCompetencies.length} competências:`);
    finalUserCompetencies.slice(0, 10).forEach(uc => {
      console.log(`   - ${uc.competencies.code}: ${uc.competencies.name} (nível ${uc.level})`);
    });
    if (finalUserCompetencies.length > 10) {
      console.log(`   ... e mais ${finalUserCompetencies.length - 10} competências`);
    }

    console.log('\n🎉 Inicialização concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

initializeUserCompetencies(); 