const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTopicStructure() {
  console.log('🔍 Verificando se a tabela topic_structure foi criada...\n');

  try {
    // 1. Verificar se a tabela existe
    console.log('1. Verificando se a tabela topic_structure existe...');
    const { data: tableData, error: tableError } = await supabase
      .from('topic_structure')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Tabela topic_structure não existe ou erro de acesso:');
      console.error(tableError);
      console.log('\n📝 Execute o script optimize-topic-structure.sql no SQL Editor do Supabase');
      return;
    }

    console.log('✅ Tabela topic_structure existe!');

    // 2. Verificar quantos registros tem
    console.log('\n2. Verificando quantidade de registros...');
    const { count, error: countError } = await supabase
      .from('topic_structure')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erro ao contar registros:', countError);
      return;
    }

    console.log(`✅ Tabela tem ${count} registros`);

    // 3. Verificar alguns registros de exemplo
    console.log('\n3. Verificando alguns registros de exemplo...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('topic_structure')
      .select('*')
      .limit(5);

    if (sampleError) {
      console.error('❌ Erro ao buscar registros:', sampleError);
      return;
    }

    console.log('📋 Exemplos de registros:');
    sampleData.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.topic_name} > ${record.subtopic_name}`);
    });

    // 4. Testar a função get_available_topics
    console.log('\n4. Testando função get_available_topics...');
    const { data: functionData, error: functionError } = await supabase
      .rpc('get_available_topics');

    if (functionError) {
      console.error('❌ Função get_available_topics não existe ou erro:');
      console.error(functionError);
      console.log('\n📝 Execute o script optimize-topic-structure.sql no SQL Editor do Supabase');
      return;
    }

    console.log('✅ Função get_available_topics funciona!');
    console.log(`📊 Retornou ${functionData.length} tópicos`);

    // 5. Mostrar alguns tópicos
    console.log('\n📋 Primeiros 3 tópicos retornados:');
    functionData.slice(0, 3).forEach((topic, index) => {
      console.log(`   ${index + 1}. ${topic.topic_name} (${topic.subtopics_count} subtópicos)`);
    });

    console.log('\n🎉 Tabela topic_structure está funcionando perfeitamente!');
    console.log('✅ Próximo passo: Atualizar o código para usar a nova estrutura');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkTopicStructure();
