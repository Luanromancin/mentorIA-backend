const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testApiTopics() {
  console.log('🧪 Testando API de tópicos...\n');

  try {
    // 1. Testar a função get_available_topics
    console.log('1. Testando função get_available_topics...');
    const { data: topicsData, error: topicsError } = await supabase
      .rpc('get_available_topics');

    if (topicsError) {
      console.error('❌ Erro na função get_available_topics:', topicsError);
      return;
    }

    console.log('✅ Função get_available_topics funcionou!');
    console.log('🔍 Debug - Tipo de dados:', typeof topicsData);
    console.log('🔍 Debug - É array?', Array.isArray(topicsData));
    console.log('🔍 Debug - É objeto?', typeof topicsData === 'object' && topicsData !== null);

    if (typeof topicsData !== 'object' || topicsData === null) {
      console.error('❌ Dados não são um objeto válido:', topicsData);
      return;
    }

    const topicNames = Object.keys(topicsData);
    console.log(`📊 Retornou ${topicNames.length} tópicos`);

    // 2. Mostrar alguns tópicos
    console.log('\n📋 Primeiros 5 tópicos:');
    topicNames.slice(0, 5).forEach((topicName, index) => {
      const subtopics = topicsData[topicName];
      console.log(`   ${index + 1}. ${topicName} (${subtopics.length} subtópicos)`);
    });

    // 3. Testar a tabela topic_structure diretamente
    console.log('\n2. Testando tabela topic_structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('topic_structure')
      .select('*')
      .limit(5);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela topic_structure:', tableError);
      return;
    }

    console.log('✅ Tabela topic_structure acessível!');
    console.log(`📊 Retornou ${tableData.length} registros de exemplo`);

    // 4. Mostrar alguns registros
    console.log('\n📋 Exemplos de registros da tabela:');
    tableData.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.topic_name} > ${record.subtopic_name}`);
    });

    // 5. Testar contagem total
    console.log('\n3. Contando total de registros...');
    const { count, error: countError } = await supabase
      .from('topic_structure')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
      return;
    }

    console.log(`✅ Tabela topic_structure tem ${count} registros no total`);

    console.log('\n🎉 Todas as verificações passaram!');
    console.log('✅ A estrutura otimizada está funcionando perfeitamente');
    console.log('✅ Próximo passo: Testar no frontend');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testApiTopics();
