const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseAccess() {
  console.log('🔍 Testando acesso ao banco de dados Supabase...');
  console.log('📋 URL:', supabaseUrl);
  console.log('🔑 Service Key:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');

  try {
    // Teste 1: Verificar se conseguimos conectar
    console.log('\n1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await client
      .from('competencies')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão básica:', testError);
    } else {
      console.log('✅ Conexão básica funcionando');
    }

    // Teste 2: Contar competências
    console.log('\n2️⃣ Testando contagem de competências...');
    const { count: competenciesCount, error: competenciesError } = await client
      .from('competencies')
      .select('*', { count: 'exact', head: true });

    if (competenciesError) {
      console.error('❌ Erro ao contar competências:', competenciesError);
    } else {
      console.log(`✅ Competências encontradas: ${competenciesCount}`);
    }

    // Teste 3: Contar questões
    console.log('\n3️⃣ Testando contagem de questões...');
    const { count: questionsCount, error: questionsError } = await client
      .from('questions')
      .select('*', { count: 'exact', head: true });

    if (questionsError) {
      console.error('❌ Erro ao contar questões:', questionsError);
    } else {
      console.log(`✅ Questões encontradas: ${questionsCount}`);
    }

    // Teste 4: Buscar algumas competências
    console.log('\n4️⃣ Testando busca de competências...');
    const { data: competencies, error: competenciesDataError } = await client
      .from('competencies')
      .select('id, code, name')
      .limit(5);

    if (competenciesDataError) {
      console.error('❌ Erro ao buscar competências:', competenciesDataError);
    } else {
      console.log('✅ Competências encontradas:');
      competencies.forEach(comp => {
        console.log(`   - ${comp.code}: ${comp.name}`);
      });
    }

    // Teste 5: Buscar algumas questões
    console.log('\n5️⃣ Testando busca de questões...');
    const { data: questions, error: questionsDataError } = await client
      .from('questions')
      .select('id, title, subtopic_name')
      .limit(3);

    if (questionsDataError) {
      console.error('❌ Erro ao buscar questões:', questionsDataError);
    } else {
      console.log('✅ Questões encontradas:');
      questions.forEach(q => {
        console.log(`   - ${q.id}: ${q.title} (${q.subtopic_name})`);
      });
    }

    // Teste 6: Testar user_competencies
    console.log('\n6️⃣ Testando acesso a user_competencies...');
    const { data: userCompetencies, error: userCompetenciesError } = await client
      .from('user_competencies')
      .select('*')
      .limit(1);

    if (userCompetenciesError) {
      console.error('❌ Erro ao acessar user_competencies:', userCompetenciesError);
    } else {
      console.log(`✅ user_competencies acessível. Registros: ${userCompetencies?.length || 0}`);
    }

    console.log('\n🎉 Teste de acesso concluído!');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testDatabaseAccess(); 